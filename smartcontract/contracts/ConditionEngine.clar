;; ConditionEngine.clar
;; Evaluates unlock conditions for Stacks Arena Vaults

(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INVALID_CONDITION (err u400))

;; Condition Types
(define-constant CONDITION_TIME u1)
(define-constant CONDITION_PENALTY u2)
(define-constant CONDITION_MULTISIG u3)
(define-constant CONDITION_MILESTONE u4)

;; @desc Evaluates a time-based condition
;; @param target-time: The timestamp at which the vault unlocks
(define-read-only (evaluate-time-lock (target-time uint))
    (if (>= stacks-block-time target-time)
        (ok true)
        (ok false)
    )
)

;; @desc Evaluates if a penalty-based unlock is eligible
;; @param lock-start: When the lock started
;; @param duration: Minimum duration for no penalty
(define-read-only (is-penalty-period (lock-start uint) (duration uint))
    (if (< stacks-block-time (+ lock-start duration))
        (ok true) ;; Still in penalty period
        (ok false) ;; Penalty period over
    )
)

;; @desc Evaluates multi-sig threshold
;; @param signatures-count: Number of valid signatures received
;; @param threshold: Required number of signatures
(define-read-only (evaluate-multisig (signatures-count uint) (threshold uint))
    (if (>= signatures-count threshold)
        (ok true)
        (ok false)
    )
)

;; @desc Evaluates milestone progress
;; @param current-milestone: The milestone index to check
;; @param total-milestones: Total milestones in the vault
(define-read-only (evaluate-milestone (current-milestone uint) (total-milestones uint))
    (if (<= current-milestone total-milestones)
        (ok true)
        (ok false)
    )
)
