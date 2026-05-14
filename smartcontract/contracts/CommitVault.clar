;; CommitVault.clar
;; Core vault logic for Stacks Arena

(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_VAULT_LOCKED (err u403))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_ALREADY_APPROVED (err u409))
(define-constant ERR_NOT_APPROVER (err u405))

;; ===== Protocol Config =====
;; Treasury address: receives penalty fees (set to deployer for now)
(define-data-var protocol-treasury principal tx-sender)

;; ===== Vault State =====
(define-map vaults
    uint ;; vault-id
    {
        owner: principal,
        balance: uint,
        lock-start: uint,
        target-block: uint,
        penalty-rate: uint, ;; Percentage (0-100)
        threshold: uint,    ;; Required approvals for multi-sig
        approval-count: uint,
        is-active: bool
    }
)

;; Maps vault-id -> approver address -> has-approved
(define-map vault-approvals
    { vault-id: uint, approver: principal }
    bool
)

(define-data-var next-vault-id uint u0)

;; ===== Read Helpers =====
(define-read-only (get-vault-details (vault-id uint))
    (map-get? vaults vault-id)
)

(define-read-only (get-approval-status (vault-id uint) (approver principal))
    (default-to false (map-get? vault-approvals { vault-id: vault-id, approver: approver }))
)

(define-read-only (get-treasury)
    (var-get protocol-treasury)
)

;; ===== Admin =====
(define-public (set-treasury (new-treasury principal))
    (begin
        (asserts! (is-eq tx-sender (var-get protocol-treasury)) ERR_UNAUTHORIZED)
        (var-set protocol-treasury new-treasury)
        (ok true)
    )
)

;; ===== Core Vault Functions =====

;; @desc Create a new time-locked vault
;; @param amount: STX amount to lock (in microSTX, supports micro units)
;; @param target-block: Block height when vault fully unlocks
;; @param penalty-rate: Early withdrawal penalty (0-100%)
;; @param threshold: Required approvals (1 = no multi-sig)
(define-public (create-vault (amount uint) (target-block uint) (penalty-rate uint) (threshold uint))
    (let
        (
            (vault-id (var-get next-vault-id))
        )
        (asserts! (> amount u0) (err u400))
        (asserts! (>= target-block block-height) (err u400))
        (asserts! (<= penalty-rate u100) (err u400))
        (asserts! (>= threshold u1) (err u400))
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        
        (map-set vaults vault-id {
            owner: tx-sender,
            balance: amount,
            lock-start: block-height,
            target-block: target-block,
            penalty-rate: penalty-rate,
            threshold: threshold,
            approval-count: u0,
            is-active: true
        })
        
        (var-set next-vault-id (+ vault-id u1))
        (ok vault-id)
    )
)

;; @desc Submit an approval for a multi-sig vault
;; @param vault-id: The vault to approve
(define-public (approve-vault (vault-id uint))
    (let
        (
            (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
            (already-approved (get-approval-status vault-id tx-sender))
        )
        (asserts! (get is-active vault) ERR_NOT_FOUND)
        (asserts! (not already-approved) ERR_ALREADY_APPROVED)

        (map-set vault-approvals { vault-id: vault-id, approver: tx-sender } true)
        (map-set vaults vault-id (merge vault { approval-count: (+ (get approval-count vault) u1) }))
        (ok true)
    )
)

;; @desc Withdraw from vault - checks time-lock and multi-sig conditions
;; @param vault-id: The vault to withdraw from
(define-public (withdraw (vault-id uint))
    (let
        (
            (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
            (is-time-unlocked (>= block-height (get target-block vault)))
            (is-multisig-met (>= (get approval-count vault) (get threshold vault)))
        )
        (asserts! (is-eq tx-sender (get owner vault)) ERR_UNAUTHORIZED)
        (asserts! (get is-active vault) ERR_NOT_FOUND)
        
        (if (and is-time-unlocked is-multisig-met)
            ;; Full withdrawal - no penalty
            (begin
                (try! (as-contract (stx-transfer? (get balance vault) tx-sender (get owner vault))))
                (map-set vaults vault-id (merge vault { balance: u0, is-active: false }))
                (ok true)
            )
            ;; Early withdrawal with penalty (only if penalty-rate > 0)
            (let
                (
                    (penalty (/ (* (get balance vault) (get penalty-rate vault)) u100))
                    (payout (- (get balance vault) penalty))
                )
                (asserts! (> (get penalty-rate vault) u0) ERR_VAULT_LOCKED)
                (try! (as-contract (stx-transfer? payout tx-sender (get owner vault))))
                ;; Route penalty to protocol treasury
                (if (> penalty u0)
                    (try! (as-contract (stx-transfer? penalty tx-sender (var-get protocol-treasury))))
                    true
                )
                (map-set vaults vault-id (merge vault { balance: u0, is-active: false }))
                (ok true)
            )
        )
    )
)
