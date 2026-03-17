# Project Roadmap & Issues - Stacks Arena

This document tracks the development of the Stacks Arena gaming platform.

---

## Phase 1: Core Contracts

### Issue #1: Lottery Pool Contract
**Status:** COMPLETED
**Description:** Implement barrier-free lottery system with participant tracking and pseudo-random draws.
- **Tasks:**
  - [x] Implement `create-round` with configurable ticket price and duration
  - [x] Implement `buy-tickets` with participant indexing
  - [x] Implement `draw-winner` with pseudo-random selection
  - [x] Implement `claim-prize` with as-contract STX transfer
  - [x] Add Clarity 4 `to-ascii?` round summaries

### Issue #2: Tournament Manager Contract
**Status:** COMPLETED
**Description:** Full tournament lifecycle with entry fees, prize splits, and refunds.
- **Tasks:**
  - [x] Implement `create-tournament` with configurable settings
  - [x] Implement `join-tournament` with STX entry fee payment
  - [x] Implement `submit-score` for player score tracking
  - [x] Implement `finalize-tournament` with winner/runner-up declaration
  - [x] Implement prize claims (70/30 split)
  - [x] Implement `cancel-tournament` and `refund-entry-fee`
  - [x] Add global player stats tracking

### Issue #3: Game Assets NFT Contract
**Status:** COMPLETED
**Description:** NFT game assets with stats, leveling, and fusion.
- **Tasks:**
  - [x] Implement `mint-asset` with stats and rarity tiers
  - [x] Implement `transfer-asset` with lock protection
  - [x] Implement XP and leveling system
  - [x] Implement `fuse-assets` for combining two assets
  - [x] Add wallet-level enumeration tracking

---

## Phase 2: Frontend Integration

### Issue #4: Gaming Dashboard
**Status:** PENDING
**Description:** Connect frontend to all three contracts.
- **Tasks:**
  - [ ] Lottery round creation and ticket purchase UI
  - [ ] Tournament browser and join flow
  - [ ] Asset gallery with mint, level-up, and fuse actions
  - [ ] Wallet connection (Leather/Xverse)

### Issue #5: Leaderboard
**Status:** PENDING
**Description:** Display player rankings based on tournament wins and earnings.
- **Tasks:**
  - [ ] Fetch player-stats from contract
  - [ ] Sort and display top players
  - [ ] Link to Stacks Explorer for verification

---

## Phase 3: Deployment

### Issue #6: Testnet Deployment
**Status:** PENDING
- [ ] Deploy all 3 contracts to Stacks testnet
- [ ] Verify barrier-free access from external wallets
- [ ] Run end-to-end lottery round test

### Issue #7: Mainnet Deployment
**Status:** PENDING
- [ ] Audit contracts
- [ ] Deploy to mainnet
- [ ] Register on Talent Protocol

---

## Completed Milestones
- [x] Project scaffold
- [x] All 3 core contracts written (barrier-free, Clarity 4)
- [x] Clarinet configuration updated
- [x] Documentation updated
