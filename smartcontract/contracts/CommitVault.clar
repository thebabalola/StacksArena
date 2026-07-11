;; CommitVault.clar
;; Core vault logic for Stacks Arena - Supports STX, SIP-010 (BTC), and Milestones

(use-trait sip010-trait .stacksarena-sip-010-trait-fix.sip-010-trait)

(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_VAULT_LOCKED (err u403))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_ALREADY_APPROVED (err u409))
(define-constant ERR_NOT_APPROVER (err u405))
(define-constant ERR_INVALID_PARAMS (err u400))

(use-trait vault-factory-trait .vault-factory-trait.vault-factory-trait)

;; ===== Protocol Config =====
(define-data-var protocol-treasury principal tx-sender)

;; ===== Multi-Admin 70% Quorum =====
(define-map admins principal bool)
(define-data-var admin-count uint u1)

;; Initialize deployer as admin
(map-set admins tx-sender true)

(define-read-only (is-admin (caller principal))
    (default-to false (map-get? admins caller))
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

(define-data-var authorized-factory principal .VaultFactory)

(define-public (set-authorized-factory (new-factory principal))
    (begin
        (asserts! (is-admin tx-sender) ERR_UNAUTHORIZED)
        (var-set authorized-factory new-factory)
        (ok true)
    )
)

;; ===== Vault State =====
(define-map vaults
    uint ;; vault-id
    {
        owner: principal,
        balance: uint,
        initial-balance: uint,
        lock-start: uint,
        target-time: uint,
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

;; Optional per-vault approver whitelist. If a vault has whitelist entries,
;; only those addresses can call approve-vault.
(define-map vault-approver-whitelist { vault-id: uint, approver: principal } bool)
(define-map vault-uses-whitelist uint bool)

(define-data-var next-vault-id uint u0)

;; ===== Read Helpers =====
(define-read-only (get-vault-details (vault-id uint))
    (map-get? vaults vault-id)
)

(define-read-only (get-approval-status (vault-id uint) (approver principal))
    (default-to false (map-get? vault-approvals { vault-id: vault-id, approver: approver }))
)

;; ===== Core Vault Functions =====

(define-private (track-vault (amount uint) (factory-contract <vault-factory-trait>))
    (begin
        (asserts! (is-eq (contract-of factory-contract) (var-get authorized-factory)) ERR_UNAUTHORIZED)
        (contract-call? factory-contract track-new-vault amount)
    )
)

;; @desc Create a new vault (supports STX and SIP-010)
(define-public (create-vault (amount uint) (target-time uint) (penalty-rate uint) (threshold uint) (token-contract (optional <sip010-trait>)) (milestones uint) (factory-contract <vault-factory-trait>))
    (let
        (
            (vault-id (var-get next-vault-id))
            (token (match token-contract t (some (contract-of t)) none))
        )
        (asserts! (> amount u0) ERR_INVALID_PARAMS)
        (asserts! (>= target-time stacks-block-time) ERR_INVALID_PARAMS)
        (asserts! (<= penalty-rate u100) ERR_INVALID_PARAMS)
        (asserts! (>= threshold u1) ERR_INVALID_PARAMS)
        (asserts! (>= milestones u1) ERR_INVALID_PARAMS)
        
        ;; Handle Asset Transfer
        (match token-contract
            token-addr (try! (contract-call? token-addr transfer amount tx-sender (as-contract tx-sender) none))
            (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        )
        
        (map-set vaults vault-id {
            owner: tx-sender,
            balance: amount,
            initial-balance: amount,
            lock-start: stacks-block-time,
            target-time: target-time,
            penalty-rate: penalty-rate,
            threshold: threshold,
            approval-count: u0,
            is-active: true,
            token: token,
            total-milestones: milestones,
            current-milestone: u0
        })
        
        (unwrap-panic (track-vault amount factory-contract))
        (var-set next-vault-id (+ vault-id u1))
        (print { event: "vault-created", vault-id: vault-id, owner: tx-sender, amount: amount, target-time: target-time, milestones: milestones })
        (ok vault-id)
    )
)

;; @desc Release a milestone (for milestone-based vaults)
(define-public (release-milestone (vault-id uint) (token-contract (optional <sip010-trait>)))
    (let
        (
            (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
            (new-milestone (+ (get current-milestone vault) u1))
            (payout (/ (get initial-balance vault) (get total-milestones vault)))
        )
        (asserts! (is-eq tx-sender (get owner vault)) ERR_UNAUTHORIZED)
        (asserts! (get is-active vault) ERR_NOT_FOUND)
        (asserts! (unwrap-panic (contract-call? .stacksarena-ConditionEngine-fix evaluate-milestone new-milestone (get total-milestones vault))) ERR_VAULT_LOCKED)
        
        ;; Handle Asset Transfer
        (match (get token vault)
            token-addr (let ((t-contract (unwrap! token-contract ERR_INVALID_PARAMS)))
                (try! (as-contract (contract-call? t-contract transfer payout (as-contract tx-sender) (get owner vault) none)))
            )
            (try! (as-contract (stx-transfer? payout (as-contract tx-sender) (get owner vault))))
        )

        (map-set vaults vault-id (merge vault { 
            current-milestone: new-milestone,
            balance: (- (get balance vault) payout),
            is-active: (not (is-eq new-milestone (get total-milestones vault)))
        }))
        (print { event: "milestone-released", vault-id: vault-id, milestone: new-milestone, payout: payout, owner: tx-sender })
        (ok true)
    )
)

(define-public (approve-vault (vault-id uint))
    (let
        (
            (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
            (already-approved (get-approval-status vault-id tx-sender))
            (uses-whitelist (default-to false (map-get? vault-uses-whitelist vault-id)))
            (is-whitelisted (default-to false (map-get? vault-approver-whitelist { vault-id: vault-id, approver: tx-sender })))
        )
        (asserts! (get is-active vault) ERR_NOT_FOUND)
        (asserts! (not already-approved) ERR_ALREADY_APPROVED)
        ;; If vault owner set a whitelist, only designated approvers may sign
        (asserts! (or (not uses-whitelist) is-whitelisted) ERR_NOT_APPROVER)

        (map-set vault-approvals { vault-id: vault-id, approver: tx-sender } true)
        (map-set vaults vault-id (merge vault { approval-count: (+ (get approval-count vault) u1) }))
        (print { event: "vault-approved", vault-id: vault-id, approver: tx-sender, new-count: (+ (get approval-count vault) u1) })
        (ok true)
    )
)

;; @desc Withdraw from vault (supports STX and SIP-010)
(define-public (withdraw (vault-id uint) (token-contract (optional <sip010-trait>)))
    (let
        (
            (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
            (is-time-unlocked (unwrap-panic (contract-call? .stacksarena-ConditionEngine-fix evaluate-time-lock (get target-time vault))))
            (is-multisig-met (unwrap-panic (contract-call? .stacksarena-ConditionEngine-fix evaluate-multisig (get approval-count vault) (get threshold vault))))
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
                (print { event: "vault-withdrawn", vault-id: vault-id, owner: tx-sender, amount: (get balance vault), early: false })
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
                (print { event: "vault-withdrawn", vault-id: vault-id, owner: tx-sender, amount: payout, penalty: penalty, early: true })
                (ok true)
            )
        )
    )
)

;; ===== Admin Functions =====

;; @desc Admin: Transfer treasury/admin rights to a new principal (e.g., multi-sig or DAO)
(define-public (set-treasury (new-treasury principal))
    (begin
        (asserts! (is-eq tx-sender (var-get protocol-treasury)) ERR_UNAUTHORIZED)
        (var-set protocol-treasury new-treasury)
        (ok true)
    )
)

;; @desc Vault owner: add or remove a designated approver for multi-sig vaults
;; Once any approver is set the vault switches to whitelist-only mode.
(define-public (set-vault-approver (vault-id uint) (approver principal) (allowed bool))
    (let
        (
            (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (get owner vault)) ERR_UNAUTHORIZED)
        (map-set vault-approver-whitelist { vault-id: vault-id, approver: approver } allowed)
        (map-set vault-uses-whitelist vault-id true)
        (ok true)
    )
)

;; @desc Read: check if a specific address is a whitelisted approver for a vault
(define-read-only (is-vault-approver (vault-id uint) (approver principal))
    (default-to false (map-get? vault-approver-whitelist { vault-id: vault-id, approver: approver }))
)

