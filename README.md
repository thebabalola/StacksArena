# Stacks Arena

**Bitcoin-Native Gaming Platform on Stacks L2**

Stacks Arena is a fully barrier-free gaming hub built on Bitcoin via the Stacks blockchain. Three ways to play — lottery pools, skill tournaments, and collectible game assets — all without admin gates, gatekeepers, or minimum financial requirements.

Any wallet can interact with every core function. No whitelists. No approvals. Just connect and play.

## How It Works

### Lottery Pool
Create lottery rounds with any ticket price (even 1 microSTX). Players buy tickets, and when the round ends, anyone can trigger the draw. The winner claims the full prize pool.

**Open functions:** `create-round`, `buy-tickets`, `draw-winner`, `claim-prize`

### Tournament Manager
Create competitive tournaments with optional entry fees (or free). Players join, submit scores, and after the end block, anyone can finalize results. Winners get 70% of the prize pool, runners-up get 30%. Cancelled tournaments auto-refund entry fees.

**Open functions:** `create-tournament`, `join-tournament`, `submit-score`, `finalize-tournament`, `claim-winner-prize`, `claim-runner-up-prize`, `cancel-tournament`, `refund-entry-fee`

### Game Assets (NFTs)
Mint game NFTs with custom stats (power, defense, speed) and rarity tiers (Common to Legendary). Level up assets with XP, fuse two assets into a stronger one, transfer and lock assets. Completely free to mint.

**Open functions:** `mint-asset`, `transfer-asset`, `add-xp`, `level-up`, `fuse-assets`, `toggle-lock`

## Barrier-Free Design

Every write function in Stacks Arena is callable by any external wallet:

| Contract | Open Write Functions | Total |
|---|---|---|
| `lottery-pool.clar` | `create-round`, `buy-tickets`, `draw-winner`, `claim-prize` | 4 |
| `tournament-manager.clar` | `create-tournament`, `join-tournament`, `submit-score`, `finalize-tournament`, `claim-winner-prize`, `claim-runner-up-prize`, `cancel-tournament`, `refund-entry-fee` | 8 |
| `game-assets.clar` | `mint-asset`, `transfer-asset`, `add-xp`, `level-up`, `fuse-assets`, `toggle-lock` | 6 |
| **Total** | | **18** |

## No Minimums

All STX-facing functions accept amounts from `u1` (0.000001 STX). There are no floor limits on:
- Ticket prices
- Tournament entry fees
- Any transaction amount

## Technical Stack

- **Clarity 4** — Latest smart contract language for Stacks
- **Nakamoto / Epoch 3.3** — Full Nakamoto upgrade compatibility
- **Clarinet** — Development and testing framework
- **Next.js** — Frontend dashboard

## Quick Start

```bash
cd smartcontract
clarinet check
clarinet console
```

## Project Structure

```
StacksGuard/
  smartcontract/
    contracts/
      lottery-pool.clar          # Lottery system
      tournament-manager.clar    # Tournament lifecycle
      game-assets.clar           # NFT game assets
    Clarinet.toml
    settings/
  frontend/
    # Next.js dashboard
```

## Deployment

### Testnet
```bash
cd smartcontract
clarinet deployments generate --testnet --low-cost
clarinet deployment apply -p deployments/default.testnet-plan.yaml
```

### Mainnet
```bash
cd smartcontract
clarinet deployments generate --mainnet --medium-cost
clarinet deployment apply -p deployments/default.mainnet-plan.yaml
```

## Clarity 4 Features Used

- `to-ascii?` — Human-readable on-chain summaries for rounds, tournaments, and asset cards
- `stacks-block-height` — Block-based timing for rounds and tournaments
- `as-contract` — Proper contract-as-principal pattern for STX custody

---

**Built for open gaming on Bitcoin.**
