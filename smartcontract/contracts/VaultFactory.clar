;; VaultFactory.clar
;; Global management and statistics for Stacks Arena Vaults

(define-constant ERR_UNAUTHORIZED (err u401))

(define-data-var total-vaults-created uint u0)
(define-data-var total-stx-locked uint u0)
;; ===== Multi-Admin 70% Quorum =====
(define-map admins principal bool)
(define-data-var admin-count uint u1)

;; Initialize deployer as admin
(map-set admins tx-sender true)

(define-read-only (is-admin (caller principal))
    (default-to false (map-get? admins caller))
)

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

(define-read-only (get-required-approvals)
    (let ((count (var-get admin-count)))
        (if (is-eq count u1)
            u1
            (/ (+ (* count u70) u99) u100)
        )
    )
)

(define-map admin-proposals
    uint
    {
        candidate: principal,
        is-add: bool,
        approvals: uint,
        executed: bool
    }
)
(define-map admin-has-approved { proposal-id: uint, approver: principal } bool)
(define-data-var next-admin-proposal-id uint u0)

(define-private (execute-admin-proposal (proposal-id uint))
    (let (
        (proposal (unwrap-panic (map-get? admin-proposals proposal-id)))
        (required-approvals (get-required-approvals))
        (candidate (get candidate proposal))
    )
        (if (>= (get approvals proposal) required-approvals)
            (begin
                (map-set admin-proposals proposal-id (merge proposal { executed: true }))
                (if (get is-add proposal)
                    (begin
                        (map-set admins candidate true)
                        (var-set admin-count (+ (var-get admin-count) u1))
                    )
                    (begin
                        (map-set admins candidate false)
                        (var-set admin-count (- (var-get admin-count) u1))
                    )
                )
                true
            )
            false
        )
    )
)

(define-public (propose-admin-change (candidate principal) (is-add bool))
    (begin
        (asserts! (is-admin tx-sender) ERR_UNAUTHORIZED)
        (let ((proposal-id (var-get next-admin-proposal-id)))
            (map-set admin-proposals proposal-id {
                candidate: candidate,
                is-add: is-add,
                approvals: u1,
                executed: false
            })
            (map-set admin-has-approved { proposal-id: proposal-id, approver: tx-sender } true)
            (var-set next-admin-proposal-id (+ proposal-id u1))
            (execute-admin-proposal proposal-id)
            (ok proposal-id)
        )
    )
)

(define-public (approve-admin-change (proposal-id uint))
    (let (
        (proposal (unwrap! (map-get? admin-proposals proposal-id) (err u404)))
    )
        (asserts! (is-admin tx-sender) ERR_UNAUTHORIZED)
        (asserts! (not (get executed proposal)) (err u400))
        (asserts! (not (default-to false (map-get? admin-has-approved { proposal-id: proposal-id, approver: tx-sender }))) (err u409))

        (map-set admin-has-approved { proposal-id: proposal-id, approver: tx-sender } true)
        (map-set admin-proposals proposal-id (merge proposal { approvals: (+ (get approvals proposal) u1) }))
        
        (execute-admin-proposal proposal-id)
        (ok true)
    )
)

;; @desc Admin: Authorize or revoke a smart contract's ability to track vaults
(define-public (set-approved-contract (contract principal) (approved bool))
    (begin
        (asserts! (is-admin tx-sender) ERR_UNAUTHORIZED)
        (map-set approved-contracts contract approved)
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
