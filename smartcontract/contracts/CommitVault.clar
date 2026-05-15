;; CommitVault.clar
;; Core vault logic for Stacks Arena - Supports STX, SIP-010 (BTC), and Milestones

(use-trait sip010-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_VAULT_LOCKED (err u403))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_ALREADY_APPROVED (err u409))
(define-constant ERR_NOT_APPROVER (err u405))
(define-constant ERR_INVALID_PARAMS (err u400))

;; ===== Protocol Config =====
(define-data-var protocol-treasury principal tx-sender)

;; ===== Vault State =====
(define-map vaults
    uint ;; vault-id
    {
        owner: principal,
        balance: uint,
        lock-start: uint,
        target-block: uint,
        penalty-rate: uint,
        threshold: uint,
        approval-count: uint,
        is-active: bool,
        token: (optional principal), ;; None for STX, Some for SIP-010
        total-milestones: uint,
        current-milestone: uint
    }
)

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

;; ===== Core Vault Functions =====

(define-private (track-vault (amount uint))
    (contract-call? .VaultFactory track-new-vault amount)
)

;; @desc Create a new vault (supports STX and SIP-010)
(define-public (create-vault (amount uint) (target-block uint) (penalty-rate uint) (threshold uint) (token (optional principal)) (milestones uint))
    (let
        (
            (vault-id (var-get next-vault-id))
        )
        (asserts! (> amount u0) ERR_INVALID_PARAMS)
        (asserts! (>= target-block block-height) ERR_INVALID_PARAMS)
        (asserts! (<= penalty-rate u100) ERR_INVALID_PARAMS)
        (asserts! (>= threshold u1) ERR_INVALID_PARAMS)
        (asserts! (>= milestones u1) ERR_INVALID_PARAMS)
        
        ;; Handle Asset Transfer
        (match token
            token-addr (try! (contract-call? token-addr transfer amount tx-sender (as-contract tx-sender) none))
            (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        )
        
        (map-set vaults vault-id {
            owner: tx-sender,
            balance: amount,
            lock-start: block-height,
            target-block: target-block,
            penalty-rate: penalty-rate,
            threshold: threshold,
            approval-count: u0,
            is-active: true,
            token: token,
            total-milestones: milestones,
            current-milestone: u0
        })
        
        (try! (track-vault amount))
        (var-set next-vault-id (+ vault-id u1))
        (ok vault-id)
    )
)

;; @desc Release a milestone (for milestone-based vaults)
(define-public (release-milestone (vault-id uint) (token-contract (optional <sip010-trait>)))
    (let
        (
            (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
            (new-milestone (+ (get current-milestone vault) u1))
            (payout (/ (get balance vault) (get total-milestones vault)))
        )
        (asserts! (is-eq tx-sender (get owner vault)) ERR_UNAUTHORIZED)
        (asserts! (get is-active vault) ERR_NOT_FOUND)
        (asserts! (<= new-milestone (get total-milestones vault)) ERR_VAULT_LOCKED)
        
        ;; Handle Asset Transfer
        (match (get token vault)
            token-addr (let ((t-contract (unwrap! token-contract ERR_INVALID_PARAMS)))
                (try! (as-contract (contract-call? t-contract transfer payout (as-contract tx-sender) (get owner vault) none)))
            )
            (try! (as-contract (stx-transfer? payout (as-contract tx-sender) (get owner vault))))
        )

        (map-set vaults vault-id (merge vault { 
            current-milestone: new-milestone,
            is-active: (not (is-eq new-milestone (get total-milestones vault)))
        }))
        (ok true)
    )
)

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

;; @desc Withdraw from vault (supports STX and SIP-010)
(define-public (withdraw (vault-id uint) (token-contract (optional <sip010-trait>)))
    (let
        (
            (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
            (is-time-unlocked (>= block-height (get target-block vault)))
            (is-multisig-met (>= (get approval-count vault) (get threshold vault)))
        )
        (asserts! (is-eq tx-sender (get owner vault)) ERR_UNAUTHORIZED)
        (asserts! (get is-active vault) ERR_NOT_FOUND)
        
        (if (and is-time-unlocked is-multisig-met)
            ;; Full withdrawal
            (begin
                (match (get token vault)
                    token-addr (let ((t-contract (unwrap! token-contract ERR_INVALID_PARAMS)))
                        (try! (as-contract (contract-call? t-contract transfer (get balance vault) (as-contract tx-sender) (get owner vault) none)))
                    )
                    (try! (as-contract (stx-transfer? (get balance vault) (as-contract tx-sender) (get owner vault))))
                )
                (map-set vaults vault-id (merge vault { balance: u0, is-active: false }))
                (ok true)
            )
            ;; Early withdrawal with penalty
            (let
                (
                    (penalty (/ (* (get balance vault) (get penalty-rate vault)) u100))
                    (payout (- (get balance vault) penalty))
                )
                (asserts! (> (get penalty-rate vault) u0) ERR_VAULT_LOCKED)
                
                (match (get token vault)
                    token-addr (let ((t-contract (unwrap! token-contract ERR_INVALID_PARAMS)))
                        (try! (as-contract (contract-call? t-contract transfer payout (as-contract tx-sender) (get owner vault) none)))
                        (if (> penalty u0)
                            (try! (as-contract (contract-call? t-contract transfer penalty (as-contract tx-sender) (var-get protocol-treasury) none)))
                            true
                        )
                    )
                    (begin
                        (try! (as-contract (stx-transfer? payout (as-contract tx-sender) (get owner vault))))
                        (if (> penalty u0)
                            (try! (as-contract (stx-transfer? penalty (as-contract tx-sender) (var-get protocol-treasury))))
                            true
                        )
                    )
                )
                (map-set vaults vault-id (merge vault { balance: u0, is-active: false }))
                (ok true)
            )
        )
    )
)
