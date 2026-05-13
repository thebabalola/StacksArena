;; CommitVault.clar
;; Core vault logic for Stacks Arena

(use-trait condition-engine-trait .ConditionEngine.condition-engine-trait)

(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_VAULT_LOCKED (err u403))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_ALREADY_EXISTS (err u409))

;; Vault State
(define-map vaults
    uint ;; vault-id
    {
        owner: principal,
        balance: uint,
        lock-start: uint,
        target-block: uint,
        penalty-rate: uint, ;; Percentage (0-100)
        threshold: uint,    ;; For multi-sig
        is-active: bool
    }
)

(define-data-var next-vault-id uint u0)

;; @desc Create a new vault
(define-public (create-vault (amount uint) (target-block uint) (penalty-rate uint) (threshold uint))
    (let
        (
            (vault-id (var-get next-vault-id))
        )
        (asserts! (>= target-block block-height) (err u400))
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        
        (map-set vaults vault-id {
            owner: tx-sender,
            balance: amount,
            lock-start: block-height,
            target-block: target-block,
            penalty-rate: penalty-rate,
            threshold: threshold,
            is-active: true
        })
        
        (var-set next-vault-id (+ vault-id u1))
        (ok vault-id)
    )
)

;; @desc Withdraw from vault (checks conditions)
(define-public (withdraw (vault-id uint))
    (let
        (
            (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
            (is-unlocked (>= block-height (get target-block vault)))
        )
        (asserts! (is-eq tx-sender (get owner vault)) ERR_UNAUTHORIZED)
        (asserts! (get is-active vault) ERR_NOT_FOUND)
        
        (if is-unlocked
            (begin
                (try! (as-contract (stx-transfer? (get balance vault) tx-sender (get owner vault))))
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
                (try! (as-contract (stx-transfer? payout tx-sender (get owner vault))))
                ;; Redirect penalty to burner or treasury (placeholder)
                (try! (as-contract (stx-transfer? penalty tx-sender (as-contract tx-sender))))
                
                (map-set vaults vault-id (merge vault { balance: u0, is-active: false }))
                (ok true)
            )
        )
    )
)

;; @desc Get vault details
(define-read-only (get-vault-details (vault-id uint))
    (map-get? vaults vault-id)
)
