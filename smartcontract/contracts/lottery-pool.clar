;; =============================================
;; STACKS ARENA -- Lottery Pool Contract
;; =============================================
;; A fully barrier-free lottery system on Bitcoin L2.
;; Any wallet can create rounds, buy tickets, trigger draws, and claim prizes.
;; No admin gates. No minimum amounts. Pure open gaming.
;; Clarity 4 | Nakamoto | Epoch 3.3

;; -----------------------------------------------
;; Constants
;; -----------------------------------------------
(define-constant ERR-ROUND-NOT-FOUND (err u100))
(define-constant ERR-ROUND-NOT-ACTIVE (err u101))
(define-constant ERR-ROUND-STILL-ACTIVE (err u102))
(define-constant ERR-INVALID-TICKET-PRICE (err u103))
(define-constant ERR-INVALID-DURATION (err u104))
(define-constant ERR-NO-TICKETS-SOLD (err u105))
(define-constant ERR-WINNER-ALREADY-DRAWN (err u106))
(define-constant ERR-NOT-WINNER (err u107))
(define-constant ERR-PRIZE-ALREADY-CLAIMED (err u108))
(define-constant ERR-WINNER-NOT-DRAWN (err u109))
(define-constant ERR-ZERO-COUNT (err u110))

;; -----------------------------------------------
;; Data Variables
;; -----------------------------------------------
(define-constant CONTRACT-ADDRESS .lottery-pool)
(define-data-var round-counter uint u0)
(define-data-var global-ticket-counter uint u0)
(define-data-var total-prize-distributed uint u0)
(define-data-var total-rounds-completed uint u0)

;; -----------------------------------------------
;; Maps
;; -----------------------------------------------
(define-map rounds uint
  {
    creator: principal,
    prize-pool: uint,
    ticket-price: uint,
    start-time: uint,
    end-time: uint,
    winner: (optional principal),
    winning-ticket: (optional uint),
    drawn: bool,
    claimed: bool,
    tickets-sold: uint,
    active: bool,
    participant-count: uint,
    range-count: uint
  }
)

;; Track each purchase range: round-id -> range-index -> { owner, start, end }
(define-map round-ranges { round-id: uint, range-index: uint } { owner: principal, start: uint, end: uint })

;; Track each buyer's ticket count per round
(define-map round-tickets { round-id: uint, buyer: principal } uint)

;; Track participants by index for winner selection
(define-map round-participants { round-id: uint, index: uint } principal)

;; Track if a principal has entered a round (for participant indexing)
(define-map round-has-entered { round-id: uint, buyer: principal } bool)

;; -----------------------------------------------
;; Public Functions -- ALL BARRIER-FREE
;; -----------------------------------------------

;; Create a new lottery round -- any wallet can call
;; ticket-price: price per ticket in microSTX (even u1 is valid)
;; duration-blocks: how many blocks the round lasts
(define-public (create-round (ticket-price uint) (duration-blocks uint))
  (let (
    (round-id (+ (var-get round-counter) u1))
    (end-time (+ stacks-block-height duration-blocks))
  )
    (asserts! (> ticket-price u0) ERR-INVALID-TICKET-PRICE)
    (asserts! (> duration-blocks u0) ERR-INVALID-DURATION)

    (map-set rounds round-id {
      creator: tx-sender,
      prize-pool: u0,
      ticket-price: ticket-price,
      start-time: stacks-block-height,
      end-time: end-time,
      winner: none,
      winning-ticket: none,
      drawn: false,
      claimed: false,
      tickets-sold: u0,
      active: true,
      participant-count: u0,
      range-count: u0
    })

    (var-set round-counter round-id)
    (print {
      event: "round-created",
      round-id: round-id,
      creator: tx-sender,
      ticket-price: ticket-price,
      end-block: end-time
    })
    (ok round-id)
  )
)

;; Buy tickets for a round -- any wallet can call
;; No maximum limit. Cost = ticket-price * count
(define-public (buy-tickets (round-id uint) (count uint))
  (let (
    (round (unwrap! (map-get? rounds round-id) ERR-ROUND-NOT-FOUND))
    (total-cost (* (get ticket-price round) count))
    (existing-tickets (default-to u0 (map-get? round-tickets { round-id: round-id, buyer: tx-sender })))
    (already-entered (default-to false (map-get? round-has-entered { round-id: round-id, buyer: tx-sender })))
    (current-participant-count (get participant-count round))
  )
    (asserts! (get active round) ERR-ROUND-NOT-ACTIVE)
    (asserts! (< stacks-block-height (get end-time round)) ERR-ROUND-STILL-ACTIVE)
    (asserts! (> count u0) ERR-ZERO-COUNT)

    ;; Transfer STX from buyer to contract
    (try! (stx-transfer? total-cost tx-sender CONTRACT-ADDRESS))

    ;; Record this purchase range
    (let (
      (total-tickets (get tickets-sold round))
      (range-id (get range-count round))
    )
      (map-set round-ranges { round-id: round-id, range-index: range-id }
        { owner: tx-sender, start: total-tickets, end: (+ total-tickets count) }
      )
      
      (if (not already-entered)
        (begin
          (map-set round-participants { round-id: round-id, index: current-participant-count } tx-sender)
          (map-set round-has-entered { round-id: round-id, buyer: tx-sender } true)
          (map-set round-tickets { round-id: round-id, buyer: tx-sender } count)
          (map-set rounds round-id (merge round {
            prize-pool: (+ (get prize-pool round) total-cost),
            tickets-sold: (+ (get tickets-sold round) count),
            participant-count: (+ current-participant-count u1),
            range-count: (+ range-id u1)
          }))
        )
        (begin
          (map-set round-tickets { round-id: round-id, buyer: tx-sender } (+ existing-tickets count))
          (map-set rounds round-id (merge round {
            prize-pool: (+ (get prize-pool round) total-cost),
            tickets-sold: (+ (get tickets-sold round) count),
            range-count: (+ range-id u1)
          }))
        )
      )
    )

    (var-set global-ticket-counter (+ (var-get global-ticket-counter) count))
    (print {
      event: "tickets-purchased",
      round-id: round-id,
      buyer: tx-sender,
      count: count,
      total-cost: total-cost
    })
    (ok true)
  )
)

;; Draw a winning ticket index -- any wallet can trigger
;; Uses block data for entropy to select a ticket from 0 to total-tickets-sold - 1
(define-public (draw-winner (round-id uint))
  (let (
    (round (unwrap! (map-get? rounds round-id) ERR-ROUND-NOT-FOUND))
    (total-tickets (get tickets-sold round))
  )
    (asserts! (get active round) ERR-ROUND-NOT-ACTIVE)
    (asserts! (>= stacks-block-height (get end-time round)) ERR-ROUND-STILL-ACTIVE)
    (asserts! (> total-tickets u0) ERR-NO-TICKETS-SOLD)
    (asserts! (not (get drawn round)) ERR-WINNER-ALREADY-DRAWN)

    ;; Pseudo-random ticket index
    (let (
      (seed (+ stacks-block-height (get prize-pool round) total-tickets))
      (winning-index (mod seed total-tickets))
    )
      (map-set rounds round-id (merge round {
        winning-ticket: (some winning-index),
        drawn: true,
        active: false
      }))

      (print {
        event: "winning-ticket-drawn",
        round-id: round-id,
        winning-ticket: winning-index,
        total-tickets: total-tickets
      })
      (ok winning-index)
    )
  )
)

;; Claim being the winner by providing the range index that covers the winning ticket
(define-public (claim-winner (round-id uint) (range-index uint))
  (let (
    (round (unwrap! (map-get? rounds round-id) ERR-ROUND-NOT-FOUND))
    (winning-ticket (unwrap! (get winning-ticket round) ERR-WINNER-NOT-DRAWN))
    (range (unwrap! (map-get? round-ranges { round-id: round-id, range-index: range-index }) ERR-ROUND-NOT-FOUND))
  )
    (asserts! (not (get claimed round)) ERR-PRIZE-ALREADY-CLAIMED)
    (asserts! (>= winning-ticket (get start range)) ERR-NOT-WINNER)
    (asserts! (< winning-ticket (get end range)) ERR-NOT-WINNER)

    (map-set rounds round-id (merge round {
      winner: (some (get owner range)),
      claimed: true
    }))

    (let (
      (prize (get prize-pool round))
      (winner (get owner range))
    )
      (try! (stx-transfer? prize CONTRACT-ADDRESS winner))
      (var-set total-prize-distributed (+ (var-get total-prize-distributed) prize))
      (var-set total-rounds-completed (+ (var-get total-rounds-completed) u1))

      (print {
        event: "prize-claimed",
        round-id: round-id,
        winner: winner,
        amount: prize,
        winning-ticket: winning-ticket
      })
      (ok prize)
    )
  )
)

;; -----------------------------------------------
;; Read-Only Functions
;; -----------------------------------------------
(define-read-only (get-round (round-id uint))
  (map-get? rounds round-id)
)

(define-read-only (get-tickets (round-id uint) (buyer principal))
  (default-to u0 (map-get? round-tickets { round-id: round-id, buyer: buyer }))
)

(define-read-only (get-participant-at (round-id uint) (index uint))
  (map-get? round-participants { round-id: round-id, index: index })
)

(define-read-only (get-total-rounds)
  (var-get round-counter)
)

(define-read-only (get-platform-stats)
  {
    total-rounds: (var-get round-counter),
    rounds-completed: (var-get total-rounds-completed),
    total-tickets-sold: (var-get global-ticket-counter),
    total-prize-distributed: (var-get total-prize-distributed)
  }
)

;; Clarity 4: to-ascii? for human-readable round info
(define-read-only (get-round-summary (round-id uint))
  (match (map-get? rounds round-id)
    round (let (
      (pool-ascii (match (to-ascii? (get prize-pool round)) ok-val ok-val err "0"))
      (tickets-ascii (match (to-ascii? (get tickets-sold round)) ok-val ok-val err "0"))
      (participants-ascii (match (to-ascii? (get participant-count round)) ok-val ok-val err "0"))
    )
      (ok {
        prize-pool: pool-ascii,
        tickets-sold: tickets-ascii,
        participants: participants-ascii,
        winning-ticket: (match (get winning-ticket round) v (match (to-ascii? v) s s err "0") "N/A"),
        drawn: (get drawn round),
        claimed: (get claimed round),
        active: (get active round)
      })
    )
    ERR-ROUND-NOT-FOUND
  )
)

;; Initialize contract principal
