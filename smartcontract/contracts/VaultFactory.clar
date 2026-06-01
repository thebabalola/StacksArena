;; VaultFactory.clar
;; Global management and statistics for Stacks Arena Vaults

(define-constant ERR_UNAUTHORIZED (err u401))

(define-data-var total-vaults-created uint u0)
(define-data-var total-stx-locked uint u0)
(define-data-var protocol-admin principal tx-sender)

;; Map of authorized contracts allowed to track vaults (e.g., CommitVault)
(define-map approved-contracts principal bool)

;; @desc Track a new vault creation
;; @param amount: STX amount locked
(define-public (track-new-vault (amount uint))
    (begin
        ;; Only authorized contracts can call this
        (asserts! (default-to false (map-get? approved-contracts contract-caller)) ERR_UNAUTHORIZED)
        (var-set total-vaults-created (+ (var-get total-vaults-created) u1))
        (var-set total-stx-locked (+ (var-get total-stx-locked) amount))
        (ok true)
    )
)

;; ===== Admin Functions =====

;; @desc Admin: Authorize or revoke a smart contract's ability to track vaults
(define-public (set-approved-contract (contract principal) (approved bool))
    (begin
        (asserts! (is-eq tx-sender (var-get protocol-admin)) ERR_UNAUTHORIZED)
        (map-set approved-contracts contract approved)
        (ok true)
    )
)

;; @desc Admin: Transfer admin rights to a new principal (e.g., DAO or Multi-Sig)
(define-public (transfer-admin (new-admin principal))
    (begin
        (asserts! (is-eq tx-sender (var-get protocol-admin)) ERR_UNAUTHORIZED)
        (var-set protocol-admin new-admin)
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
