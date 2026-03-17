;; =============================================
;; STACKS ARENA — Game Assets NFT Contract
;; =============================================
;; Fully barrier-free game asset (NFT) system on Bitcoin L2.
;; Any wallet can mint assets, transfer them, level up, and fuse assets.
;; No admin gates. No mint fees required (free mint). Open gaming collectibles.
;; Clarity 4 | Nakamoto | Epoch 3.3

;; -----------------------------------------------
;; Constants
;; -----------------------------------------------
(define-constant ERR-ASSET-NOT-FOUND (err u300))
(define-constant ERR-NOT-OWNER (err u301))
(define-constant ERR-SAME-RECIPIENT (err u302))
(define-constant ERR-EMPTY-TYPE (err u303))
(define-constant ERR-ASSET-LOCKED (err u304))
(define-constant ERR-INSUFFICIENT-XP (err u305))
(define-constant ERR-MAX-LEVEL (err u306))
(define-constant ERR-SAME-ASSET (err u307))
(define-constant ERR-DIFFERENT-TYPE (err u308))
(define-constant ERR-TRANSFER-FAILED (err u309))

;; Rarity tiers
(define-constant RARITY-COMMON u1)
(define-constant RARITY-UNCOMMON u2)
(define-constant RARITY-RARE u3)
(define-constant RARITY-EPIC u4)
(define-constant RARITY-LEGENDARY u5)

;; Level caps
(define-constant MAX-LEVEL u50)
(define-constant XP-PER-LEVEL u100)

;; -----------------------------------------------
;; Data Variables
;; -----------------------------------------------
(define-data-var next-asset-id uint u1)
(define-data-var total-assets-minted uint u0)
(define-data-var total-assets-fused uint u0)

;; -----------------------------------------------
;; Maps
;; -----------------------------------------------
(define-map assets uint
  {
    owner: principal,
    asset-type: (string-ascii 32),
    name: (string-ascii 64),
    power: uint,
    defense: uint,
    speed: uint,
    rarity: uint,
    level: uint,
    xp: uint,
    minted-at: uint,
    locked: bool,
    fused-from: (optional uint)
  }
)

;; Track how many assets each wallet owns
(define-map wallet-asset-count principal uint)

;; Track asset ownership by wallet and index (for enumeration)
(define-map wallet-assets { owner: principal, index: uint } uint)

;; -----------------------------------------------
;; Public Functions — ALL BARRIER-FREE
;; -----------------------------------------------

;; Mint a new game asset — any wallet can call, completely free
(define-public (mint-asset
    (asset-type (string-ascii 32))
    (name (string-ascii 64))
    (power uint)
    (defense uint)
    (speed uint)
    (rarity uint)
  )
  (let (
    (asset-id (var-get next-asset-id))
    (current-count (default-to u0 (map-get? wallet-asset-count tx-sender)))
    (valid-rarity (if (> rarity RARITY-LEGENDARY) RARITY-COMMON rarity))
  )
    (asserts! (> (len asset-type) u0) ERR-EMPTY-TYPE)
    (asserts! (> (len name) u0) (err u310))

    (map-set assets asset-id {
      owner: tx-sender,
      asset-type: asset-type,
      name: name,
      power: power,
      defense: defense,
      speed: speed,
      rarity: (if (is-eq valid-rarity u0) RARITY-COMMON valid-rarity),
      level: u1,
      xp: u0,
      minted-at: stacks-block-height,
      locked: false,
      fused-from: none
    })

    ;; Track ownership
    (map-set wallet-assets { owner: tx-sender, index: current-count } asset-id)
    (map-set wallet-asset-count tx-sender (+ current-count u1))

    (var-set next-asset-id (+ asset-id u1))
    (var-set total-assets-minted (+ (var-get total-assets-minted) u1))

    (print {
      event: "asset-minted",
      asset-id: asset-id,
      owner: tx-sender,
      asset-type: asset-type,
      name: name,
      rarity: (if (is-eq valid-rarity u0) RARITY-COMMON valid-rarity)
    })
    (ok asset-id)
  )
)

;; Transfer an asset to another wallet — owner only
(define-public (transfer-asset (asset-id uint) (recipient principal))
  (let (
    (asset (unwrap! (map-get? assets asset-id) ERR-ASSET-NOT-FOUND))
    (sender-count (default-to u0 (map-get? wallet-asset-count tx-sender)))
    (recipient-count (default-to u0 (map-get? wallet-asset-count recipient)))
  )
    (asserts! (is-eq tx-sender (get owner asset)) ERR-NOT-OWNER)
    (asserts! (not (is-eq tx-sender recipient)) ERR-SAME-RECIPIENT)
    (asserts! (not (get locked asset)) ERR-ASSET-LOCKED)

    ;; Update ownership
    (map-set assets asset-id (merge asset { owner: recipient }))

    ;; Track on recipient side
    (map-set wallet-assets { owner: recipient, index: recipient-count } asset-id)
    (map-set wallet-asset-count recipient (+ recipient-count u1))

    (print {
      event: "asset-transferred",
      asset-id: asset-id,
      from: tx-sender,
      to: recipient
    })
    (ok true)
  )
)

;; Add XP to an asset — any wallet can grant XP to their own asset
(define-public (add-xp (asset-id uint) (xp-amount uint))
  (let (
    (asset (unwrap! (map-get? assets asset-id) ERR-ASSET-NOT-FOUND))
    (new-xp (+ (get xp asset) xp-amount))
  )
    (asserts! (is-eq tx-sender (get owner asset)) ERR-NOT-OWNER)
    (asserts! (< (get level asset) MAX-LEVEL) ERR-MAX-LEVEL)

    (map-set assets asset-id (merge asset { xp: new-xp }))

    (print {
      event: "xp-added",
      asset-id: asset-id,
      xp-added: xp-amount,
      total-xp: new-xp
    })
    (ok new-xp)
  )
)

;; Level up an asset — spends accumulated XP
(define-public (level-up (asset-id uint))
  (let (
    (asset (unwrap! (map-get? assets asset-id) ERR-ASSET-NOT-FOUND))
    (current-level (get level asset))
    (required-xp (* current-level XP-PER-LEVEL))
  )
    (asserts! (is-eq tx-sender (get owner asset)) ERR-NOT-OWNER)
    (asserts! (< current-level MAX-LEVEL) ERR-MAX-LEVEL)
    (asserts! (>= (get xp asset) required-xp) ERR-INSUFFICIENT-XP)

    ;; Level up: increase stats based on rarity multiplier
    (let ((rarity-bonus (get rarity asset)))
      (map-set assets asset-id (merge asset {
        level: (+ current-level u1),
        xp: (- (get xp asset) required-xp),
        power: (+ (get power asset) rarity-bonus),
        defense: (+ (get defense asset) rarity-bonus),
        speed: (+ (get speed asset) rarity-bonus)
      }))
    )

    (print {
      event: "asset-leveled-up",
      asset-id: asset-id,
      new-level: (+ current-level u1),
      owner: tx-sender
    })
    (ok (+ current-level u1))
  )
)

;; Fuse two assets of the same type — creates a stronger asset, burns the originals
(define-public (fuse-assets (asset-id-1 uint) (asset-id-2 uint))
  (let (
    (asset1 (unwrap! (map-get? assets asset-id-1) ERR-ASSET-NOT-FOUND))
    (asset2 (unwrap! (map-get? assets asset-id-2) ERR-ASSET-NOT-FOUND))
    (new-id (var-get next-asset-id))
    (owner-count (default-to u0 (map-get? wallet-asset-count tx-sender)))
    ;; Fused rarity: min of (max rarity of the two + 1, LEGENDARY)
    (new-rarity (if (>= (if (> (get rarity asset1) (get rarity asset2)) (get rarity asset1) (get rarity asset2)) RARITY-LEGENDARY)
                  RARITY-LEGENDARY
                  (+ (if (> (get rarity asset1) (get rarity asset2)) (get rarity asset1) (get rarity asset2)) u1)))
  )
    (asserts! (is-eq tx-sender (get owner asset1)) ERR-NOT-OWNER)
    (asserts! (is-eq tx-sender (get owner asset2)) ERR-NOT-OWNER)
    (asserts! (not (is-eq asset-id-1 asset-id-2)) ERR-SAME-ASSET)
    (asserts! (is-eq (get asset-type asset1) (get asset-type asset2)) ERR-DIFFERENT-TYPE)
    (asserts! (not (get locked asset1)) ERR-ASSET-LOCKED)
    (asserts! (not (get locked asset2)) ERR-ASSET-LOCKED)

    ;; Lock the source assets (burn equivalent — they can't be used or transferred anymore)
    (map-set assets asset-id-1 (merge asset1 { locked: true }))
    (map-set assets asset-id-2 (merge asset2 { locked: true }))

    ;; Create the fused asset with combined stats
    (map-set assets new-id {
      owner: tx-sender,
      asset-type: (get asset-type asset1),
      name: (get name asset1),
      power: (+ (get power asset1) (get power asset2)),
      defense: (+ (get defense asset1) (get defense asset2)),
      speed: (+ (get speed asset1) (get speed asset2)),
      rarity: new-rarity,
      level: (+ (if (> (get level asset1) (get level asset2)) (get level asset1) (get level asset2)) u1),
      xp: u0,
      minted-at: stacks-block-height,
      locked: false,
      fused-from: (some asset-id-1)
    })

    (map-set wallet-assets { owner: tx-sender, index: owner-count } new-id)
    (map-set wallet-asset-count tx-sender (+ owner-count u1))
    (var-set next-asset-id (+ new-id u1))
    (var-set total-assets-minted (+ (var-get total-assets-minted) u1))
    (var-set total-assets-fused (+ (var-get total-assets-fused) u1))

    (print {
      event: "assets-fused",
      source-1: asset-id-1,
      source-2: asset-id-2,
      result-id: new-id,
      new-rarity: new-rarity,
      owner: tx-sender
    })
    (ok new-id)
  )
)

;; Lock/unlock an asset (e.g., while in a tournament)
(define-public (toggle-lock (asset-id uint))
  (let (
    (asset (unwrap! (map-get? assets asset-id) ERR-ASSET-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (get owner asset)) ERR-NOT-OWNER)
    (map-set assets asset-id (merge asset { locked: (not (get locked asset)) }))

    (print {
      event: "asset-lock-toggled",
      asset-id: asset-id,
      locked: (not (get locked asset))
    })
    (ok (not (get locked asset)))
  )
)

;; -----------------------------------------------
;; Read-Only Functions
;; -----------------------------------------------
(define-read-only (get-asset (asset-id uint))
  (map-get? assets asset-id)
)

(define-read-only (get-asset-owner (asset-id uint))
  (match (map-get? assets asset-id)
    asset (ok (get owner asset))
    ERR-ASSET-NOT-FOUND
  )
)

(define-read-only (get-wallet-count (owner principal))
  (default-to u0 (map-get? wallet-asset-count owner))
)

(define-read-only (get-wallet-asset-at (owner principal) (index uint))
  (map-get? wallet-assets { owner: owner, index: index })
)

(define-read-only (get-next-asset-id)
  (var-get next-asset-id)
)

(define-read-only (get-collection-stats)
  {
    total-minted: (var-get total-assets-minted),
    total-fused: (var-get total-assets-fused),
    next-id: (var-get next-asset-id)
  }
)

;; Clarity 4: to-ascii? for human-readable asset card
(define-read-only (get-asset-card (asset-id uint))
  (match (map-get? assets asset-id)
    asset (let (
      (power-ascii (match (to-ascii? (get power asset)) ok-val ok-val err "0"))
      (defense-ascii (match (to-ascii? (get defense asset)) ok-val ok-val err "0"))
      (speed-ascii (match (to-ascii? (get speed asset)) ok-val ok-val err "0"))
      (level-ascii (match (to-ascii? (get level asset)) ok-val ok-val err "0"))
      (rarity-str (if (is-eq (get rarity asset) RARITY-COMMON) "COMMON"
        (if (is-eq (get rarity asset) RARITY-UNCOMMON) "UNCOMMON"
        (if (is-eq (get rarity asset) RARITY-RARE) "RARE"
        (if (is-eq (get rarity asset) RARITY-EPIC) "EPIC"
        "LEGENDARY")))))
    )
      (ok {
        name: (get name asset),
        asset-type: (get asset-type asset),
        power: power-ascii,
        defense: defense-ascii,
        speed: speed-ascii,
        level: level-ascii,
        rarity: rarity-str,
        locked: (get locked asset)
      })
    )
    ERR-ASSET-NOT-FOUND
  )
)
