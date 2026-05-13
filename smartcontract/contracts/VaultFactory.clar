;; VaultFactory.clar
;; Global management and statistics for Stacks Arena Vaults

(define-constant ERR_UNAUTHORIZED (err u401))

(define-data-var total-vaults-created uint u0)
(define-data-var total-stx-locked uint u0)

;; @desc Track a new vault creation
;; @param amount: STX amount locked
(define-public (track-new-vault (amount uint))
    (begin
        ;; Only authorized contracts or the owner should call this in a real setup
        ;; For MVP, we'll keep it open or restrict to tx-sender
        (var-set total-vaults-created (+ (var-get total-vaults-created) u1))
        (var-set total-stx-locked (+ (var-get total-stx-locked) amount))
        (ok true)
    )
)

;; @desc Get global statistics
(define-read-only (get-protocol-stats)
    {
        total-vaults: (var-get total-vaults-created),
        total-locked: (var-get total-stx-locked)
    }
)
