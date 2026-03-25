;; =============================================
;; STACKS ARENA -- Tournament Manager Contract
;; =============================================
;; Fully barrier-free tournament system on Bitcoin L2.
;; Any wallet can create tournaments, join them, record results, and claim prizes.
;; No admin gates. No minimum entry fees. Open competitive gaming.
;; Clarity 4 | Nakamoto | Epoch 3.3

;; -----------------------------------------------
;; Constants
;; -----------------------------------------------
(define-constant ERR-TOURNAMENT-NOT-FOUND (err u200))
(define-constant ERR-TOURNAMENT-NOT-ACTIVE (err u201))
(define-constant ERR-TOURNAMENT-FULL (err u202))
(define-constant ERR-ALREADY-JOINED (err u203))
(define-constant ERR-NOT-JOINED (err u204))
(define-constant ERR-TOURNAMENT-NOT-ENDED (err u205))
(define-constant ERR-ALREADY-FINALIZED (err u206))
(define-constant ERR-INVALID-MAX-PLAYERS (err u207))
(define-constant ERR-NOT-WINNER (err u208))
(define-constant ERR-PRIZE-CLAIMED (err u209))
(define-constant ERR-INVALID-ENTRY-FEE (err u210))
(define-constant ERR-MIN-PLAYERS-NOT-MET (err u212))
(define-constant ERR-NOT-CREATOR (err u214))
(define-constant ERR-INVALID-DURATION (err u215))

;; Status
(define-constant STATUS-OPEN u0)
(define-constant STATUS-ACTIVE u1)
(define-constant STATUS-FINALIZED u2)
(define-constant STATUS-CANCELLED u3)

;; -----------------------------------------------
;; Data Variables
;; -----------------------------------------------
(define-constant CONTRACT-ADDRESS .tournament-manager)
(define-data-var tournament-counter uint u0)
(define-data-var total-tournaments-completed uint u0)
(define-data-var total-prize-pool-distributed uint u0)

;; -----------------------------------------------
;; Maps
;; -----------------------------------------------
(define-map tournaments uint
  {
    creator: principal,
    title: (string-ascii 64),
    description: (string-ascii 256),
    entry-fee: uint,
    prize-pool: uint,
    max-players: uint,
    current-players: uint,
    min-players: uint,
    start-block: uint,
    end-block: uint,
    status: uint,
    winner: (optional principal),
    runner-up: (optional principal),
    top-score: uint,
    runner-up-score: uint,
    prize-claimed: bool,
    runner-up-claimed: bool
  }
)

;; Track player membership in tournaments
(define-map tournament-players { tournament-id: uint, player: principal } bool)

;; Track player index for enumeration
(define-map tournament-player-index { tournament-id: uint, index: uint } principal)

;; Track player scores (for result recording)
(define-map player-scores { tournament-id: uint, player: principal } uint)

;; Global player stats
(define-map player-stats principal
  {
    tournaments-joined: uint,
    tournaments-won: uint,
    total-earnings: uint
  }
)

;; -----------------------------------------------
;; Public Functions -- ALL BARRIER-FREE
;; -----------------------------------------------

;; Create a tournament -- any wallet can call
;; entry-fee: in microSTX (even u1 is valid, or u0 for free tournaments)
(define-public (create-tournament
    (title (string-ascii 64))
    (description (string-ascii 256))
    (entry-fee uint)
    (max-players uint)
    (min-players uint)
    (duration-blocks uint)
  )
  (let (
    (tid (+ (var-get tournament-counter) u1))
    (end-block (+ stacks-block-height duration-blocks))
  )
    (asserts! (> (len title) u0) (err u220))
    (asserts! (> max-players u1) ERR-INVALID-MAX-PLAYERS)
    (asserts! (>= max-players min-players) ERR-INVALID-MAX-PLAYERS)
    (asserts! (>= min-players u2) ERR-MIN-PLAYERS-NOT-MET)
    (asserts! (> duration-blocks u0) ERR-INVALID-DURATION)

    (map-set tournaments tid {
      creator: tx-sender,
      title: title,
      description: description,
      entry-fee: entry-fee,
      prize-pool: u0,
      max-players: max-players,
      current-players: u0,
      min-players: min-players,
      start-block: stacks-block-height,
      end-block: end-block,
      status: STATUS-OPEN,
      winner: none,
      runner-up: none,
      top-score: u0,
      runner-up-score: u0,
      prize-claimed: false,
      runner-up-claimed: false
    })

    (var-set tournament-counter tid)
    (print {
      event: "tournament-created",
      tournament-id: tid,
      creator: tx-sender,
      entry-fee: entry-fee,
      max-players: max-players,
      end-block: end-block
    })
    (ok tid)
  )
)

;; Join a tournament -- any wallet can call
;; Pays entry fee (if any) and registers as participant
(define-public (join-tournament (tournament-id uint))
  (let (
    (tournament (unwrap! (map-get? tournaments tournament-id) ERR-TOURNAMENT-NOT-FOUND))
    (already-joined (default-to false (map-get? tournament-players { tournament-id: tournament-id, player: tx-sender })))
    (current-count (get current-players tournament))
  )
    (asserts! (is-eq (get status tournament) STATUS-OPEN) ERR-TOURNAMENT-NOT-ACTIVE)
    (asserts! (< stacks-block-height (get end-block tournament)) ERR-TOURNAMENT-NOT-ENDED)
    (asserts! (not already-joined) ERR-ALREADY-JOINED)
    (asserts! (< current-count (get max-players tournament)) ERR-TOURNAMENT-FULL)

    ;; Pay entry fee if > 0
    (if (> (get entry-fee tournament) u0)
      (try! (stx-transfer? (get entry-fee tournament) tx-sender CONTRACT-ADDRESS))
      true
    )

    ;; Register player
    (map-set tournament-players { tournament-id: tournament-id, player: tx-sender } true)
    (map-set tournament-player-index { tournament-id: tournament-id, index: current-count } tx-sender)
    (map-set player-scores { tournament-id: tournament-id, player: tx-sender } u0)

    ;; Update tournament
    (map-set tournaments tournament-id (merge tournament {
      prize-pool: (+ (get prize-pool tournament) (get entry-fee tournament)),
      current-players: (+ current-count u1)
    }))

    ;; Update player global stats
    (let ((stats (default-to { tournaments-joined: u0, tournaments-won: u0, total-earnings: u0 }
                    (map-get? player-stats tx-sender))))
      (map-set player-stats tx-sender (merge stats {
        tournaments-joined: (+ (get tournaments-joined stats) u1)
      }))
    )

    (print {
      event: "player-joined",
      tournament-id: tournament-id,
      player: tx-sender,
      entry-fee-paid: (get entry-fee tournament),
      total-players: (+ current-count u1)
    })
    (ok true)
  )
)

;; Submit a score -- any joined player can submit their score
(define-public (submit-score (tournament-id uint) (score uint))
  (let (
    (tournament (unwrap! (map-get? tournaments tournament-id) ERR-TOURNAMENT-NOT-FOUND))
    (is-player (default-to false (map-get? tournament-players { tournament-id: tournament-id, player: tx-sender })))
  )
    (asserts! is-player ERR-NOT-JOINED)
    (asserts! (or (is-eq (get status tournament) STATUS-OPEN) (is-eq (get status tournament) STATUS-ACTIVE)) ERR-TOURNAMENT-NOT-ACTIVE)

    (map-set player-scores { tournament-id: tournament-id, player: tx-sender } score)
    
    ;; Update top scores in real-time
    (if (> score (get top-score tournament))
      (map-set tournaments tournament-id (merge tournament {
        runner-up: (get winner tournament),
        runner-up-score: (get top-score tournament),
        winner: (some tx-sender),
        top-score: score
      }))
      (if (and (> score (get runner-up-score tournament)) (not (is-eq (some tx-sender) (get winner tournament))))
        (map-set tournaments tournament-id (merge tournament {
          runner-up: (some tx-sender),
          runner-up-score: score
        }))
        true
      )
    )

    (print {
      event: "score-submitted",
      tournament-id: tournament-id,
      player: tx-sender,
      score: score
    })
    (ok true)
  )
)

;; Finalize tournament -- any wallet can trigger after end-block
;; Uses real-time tracked winners
(define-public (finalize-tournament (tournament-id uint))
  (let (
    (tournament (unwrap! (map-get? tournaments tournament-id) ERR-TOURNAMENT-NOT-FOUND))
  )
    (asserts! (not (is-eq (get status tournament) STATUS-FINALIZED)) ERR-ALREADY-FINALIZED)
    (asserts! (>= stacks-block-height (get end-block tournament)) ERR-TOURNAMENT-NOT-ENDED)
    (asserts! (>= (get current-players tournament) (get min-players tournament)) ERR-MIN-PLAYERS-NOT-MET)

    (map-set tournaments tournament-id (merge tournament {
      status: STATUS-FINALIZED
    }))

    (var-set total-tournaments-completed (+ (var-get total-tournaments-completed) u1))
    (print {
      event: "tournament-finalized",
      tournament-id: tournament-id,
      winner: (get winner tournament),
      runner-up: (get runner-up tournament),
      prize-pool: (get prize-pool tournament)
    })
    (ok true)
  )
)

;; Claim winner prize (70% of pool) -- only winner can call
(define-public (claim-winner-prize (tournament-id uint))
  (let (
    (tournament (unwrap! (map-get? tournaments tournament-id) ERR-TOURNAMENT-NOT-FOUND))
    (pool (get prize-pool tournament))
    (winner-share (/ (* pool u70) u100))
  )
    (asserts! (is-eq (get status tournament) STATUS-FINALIZED) ERR-TOURNAMENT-NOT-ACTIVE)
    (asserts! (is-eq (get winner tournament) (some tx-sender)) ERR-NOT-WINNER)
    (asserts! (not (get prize-claimed tournament)) ERR-PRIZE-CLAIMED)
    (asserts! (> winner-share u0) (err u230))

    (map-set tournaments tournament-id (merge tournament { prize-claimed: true }))
    (try! (stx-transfer? winner-share CONTRACT-ADDRESS (unwrap! (get winner tournament) ERR-NOT-WINNER)))

    ;; Update winner stats
    (let ((stats (default-to { tournaments-joined: u0, tournaments-won: u0, total-earnings: u0 }
                    (map-get? player-stats tx-sender))))
      (map-set player-stats tx-sender (merge stats {
        tournaments-won: (+ (get tournaments-won stats) u1),
        total-earnings: (+ (get total-earnings stats) winner-share)
      }))
    )

    (var-set total-prize-pool-distributed (+ (var-get total-prize-pool-distributed) winner-share))
    (print {
      event: "winner-prize-claimed",
      tournament-id: tournament-id,
      winner: tx-sender,
      amount: winner-share
    })
    (ok winner-share)
  )
)

;; Claim runner-up prize (30% of pool) -- only runner-up can call
(define-public (claim-runner-up-prize (tournament-id uint))
  (let (
    (tournament (unwrap! (map-get? tournaments tournament-id) ERR-TOURNAMENT-NOT-FOUND))
    (pool (get prize-pool tournament))
    (runner-up-share (/ (* pool u30) u100))
  )
    (asserts! (is-eq (get status tournament) STATUS-FINALIZED) ERR-TOURNAMENT-NOT-ACTIVE)
    (asserts! (is-eq (get runner-up tournament) (some tx-sender)) ERR-NOT-WINNER)
    (asserts! (not (get runner-up-claimed tournament)) ERR-PRIZE-CLAIMED)
    (asserts! (> runner-up-share u0) (err u231))

    (map-set tournaments tournament-id (merge tournament { runner-up-claimed: true }))
    (try! (stx-transfer? runner-up-share CONTRACT-ADDRESS (unwrap! (get runner-up tournament) ERR-NOT-WINNER)))

    ;; Update runner-up stats
    (let ((stats (default-to { tournaments-joined: u0, tournaments-won: u0, total-earnings: u0 }
                    (map-get? player-stats tx-sender))))
      (map-set player-stats tx-sender (merge stats {
        total-earnings: (+ (get total-earnings stats) runner-up-share)
      }))
    )

    (var-set total-prize-pool-distributed (+ (var-get total-prize-pool-distributed) runner-up-share))
    (print {
      event: "runner-up-prize-claimed",
      tournament-id: tournament-id,
      runner-up: tx-sender,
      amount: runner-up-share
    })
    (ok runner-up-share)
  )
)

;; Cancel tournament -- only creator can call, only before finalization
;; Refunds are handled per-player via refund-entry-fee
(define-public (cancel-tournament (tournament-id uint))
  (let (
    (tournament (unwrap! (map-get? tournaments tournament-id) ERR-TOURNAMENT-NOT-FOUND))
  )
    (asserts! (is-eq (get creator tournament) tx-sender) ERR-NOT-CREATOR)
    (asserts! (or (is-eq (get status tournament) STATUS-OPEN) (is-eq (get status tournament) STATUS-ACTIVE)) ERR-ALREADY-FINALIZED)

    (map-set tournaments tournament-id (merge tournament { status: STATUS-CANCELLED }))
    (print {
      event: "tournament-cancelled",
      tournament-id: tournament-id,
      creator: tx-sender
    })
    (ok true)
  )
)

;; Refund entry fee from cancelled tournament -- any affected player can call
(define-public (refund-entry-fee (tournament-id uint))
  (let (
    (tournament (unwrap! (map-get? tournaments tournament-id) ERR-TOURNAMENT-NOT-FOUND))
    (is-player (default-to false (map-get? tournament-players { tournament-id: tournament-id, player: tx-sender })))
  )
    (asserts! (is-eq (get status tournament) STATUS-CANCELLED) ERR-TOURNAMENT-NOT-ACTIVE)
    (asserts! is-player ERR-NOT-JOINED)
    (asserts! (> (get entry-fee tournament) u0) ERR-INVALID-ENTRY-FEE)

    ;; Remove player to prevent double refund
    (map-set tournament-players { tournament-id: tournament-id, player: tx-sender } false)
    (try! (stx-transfer? (get entry-fee tournament) CONTRACT-ADDRESS tx-sender))

    (print {
      event: "entry-fee-refunded",
      tournament-id: tournament-id,
      player: tx-sender,
      amount: (get entry-fee tournament)
    })
    (ok (get entry-fee tournament))
  )
)

;; -----------------------------------------------
;; Read-Only Functions
;; -----------------------------------------------
(define-read-only (get-tournament (tournament-id uint))
  (map-get? tournaments tournament-id)
)

(define-read-only (is-player-joined (tournament-id uint) (player principal))
  (default-to false (map-get? tournament-players { tournament-id: tournament-id, player: player }))
)

(define-read-only (get-player-score (tournament-id uint) (player principal))
  (default-to u0 (map-get? player-scores { tournament-id: tournament-id, player: player }))
)

(define-read-only (get-player-stats-info (player principal))
  (default-to { tournaments-joined: u0, tournaments-won: u0, total-earnings: u0 }
    (map-get? player-stats player))
)

(define-read-only (get-player-at-index (tournament-id uint) (index uint))
  (map-get? tournament-player-index { tournament-id: tournament-id, index: index })
)

(define-read-only (get-total-tournaments)
  (var-get tournament-counter)
)

(define-read-only (get-arena-stats)
  {
    total-tournaments: (var-get tournament-counter),
    tournaments-completed: (var-get total-tournaments-completed),
    total-prize-distributed: (var-get total-prize-pool-distributed)
  }
)

;; Clarity 4: to-ascii? for human-readable tournament info
(define-read-only (get-tournament-summary (tournament-id uint))
  (match (map-get? tournaments tournament-id)
    t (let (
      (pool-ascii (match (to-ascii? (get prize-pool t)) ok-val ok-val err "0"))
      (players-ascii (match (to-ascii? (get current-players t)) ok-val ok-val err "0"))
      (max-ascii (match (to-ascii? (get max-players t)) ok-val ok-val err "0"))
      (status-str (if (is-eq (get status t) STATUS-OPEN) "OPEN"
        (if (is-eq (get status t) STATUS-ACTIVE) "ACTIVE"
        (if (is-eq (get status t) STATUS-FINALIZED) "FINALIZED"
        "CANCELLED"))))
    )
      (ok {
        title: (get title t),
        prize-pool: pool-ascii,
        players: players-ascii,
        max-players: max-ascii,
        status: status-str
      })
    )
    ERR-TOURNAMENT-NOT-FOUND
  )
)

;; Initialize contract principal
