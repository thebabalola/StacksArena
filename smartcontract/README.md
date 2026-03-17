# Smart Contracts — Stacks Arena

This directory contains the Clarity 4 smart contracts for Stacks Arena, a barrier-free gaming platform on Bitcoin L2.

## Contracts

### lottery-pool.clar
A fully open lottery system. Any wallet can create rounds, buy tickets, trigger draws, and claim prizes.

**Data structures:**
- `rounds` — Round config, prize pool, timing, winner
- `round-tickets` — Per-buyer ticket count per round
- `round-participants` — Indexed participants for fair draw
- `round-has-entered` — Dedup tracker for participant indexing

**Write functions (all barrier-free):**
- `create-round(ticket-price, duration-blocks)` — Start a new lottery round
- `buy-tickets(round-id, count)` — Purchase tickets with STX
- `draw-winner(round-id)` — Trigger pseudo-random winner selection after round ends
- `claim-prize(round-id)` — Winner withdraws the prize pool

**Read functions:**
- `get-round`, `get-tickets`, `get-participant-at`, `get-total-rounds`
- `get-platform-stats` — Global lottery statistics
- `get-round-summary` — Clarity 4 `to-ascii?` human-readable round info

---

### tournament-manager.clar
A complete tournament lifecycle manager. Create, join, compete, finalize, claim prizes or refund.

**Data structures:**
- `tournaments` — Full tournament config with prize split tracking
- `tournament-players` — Player membership per tournament
- `tournament-player-index` — Indexed players for enumeration
- `player-scores` — Score tracking per player per tournament
- `player-stats` — Global career stats (joins, wins, earnings)

**Write functions (all barrier-free):**
- `create-tournament(title, description, entry-fee, max-players, min-players, duration-blocks)` — Create a tournament (free or paid)
- `join-tournament(tournament-id)` — Join and pay entry fee
- `submit-score(tournament-id, score)` — Record your score
- `finalize-tournament(tournament-id, winner, runner-up)` — End tournament and declare winners
- `claim-winner-prize(tournament-id)` — Winner claims 70% of pool
- `claim-runner-up-prize(tournament-id)` — Runner-up claims 30% of pool
- `cancel-tournament(tournament-id)` — Creator cancels (enables refunds)
- `refund-entry-fee(tournament-id)` — Players reclaim fees from cancelled tournaments

**Read functions:**
- `get-tournament`, `is-player-joined`, `get-player-score`, `get-player-stats-info`
- `get-arena-stats` — Global tournament statistics
- `get-tournament-summary` — Clarity 4 `to-ascii?` human-readable tournament info

---

### game-assets.clar
NFT-style game assets with stats, leveling, and fusion mechanics.

**Data structures:**
- `assets` — Full asset with stats, rarity, level, XP, lock state
- `wallet-asset-count` — Asset count per wallet
- `wallet-assets` — Indexed assets per wallet for enumeration

**Write functions (all barrier-free):**
- `mint-asset(asset-type, name, power, defense, speed, rarity)` — Free mint, any wallet
- `transfer-asset(asset-id, recipient)` — Owner transfers to another wallet
- `add-xp(asset-id, xp-amount)` — Grant XP to your asset
- `level-up(asset-id)` — Spend XP to increase level and stats
- `fuse-assets(asset-id-1, asset-id-2)` — Combine two same-type assets into a stronger one
- `toggle-lock(asset-id)` — Lock/unlock asset (e.g. during tournament)

**Read functions:**
- `get-asset`, `get-asset-owner`, `get-wallet-count`, `get-wallet-asset-at`
- `get-collection-stats` — Mint and fusion totals
- `get-asset-card` — Clarity 4 `to-ascii?` human-readable asset card

## Rarity Tiers

| Value | Tier |
|---|---|
| `u1` | Common |
| `u2` | Uncommon |
| `u3` | Rare |
| `u4` | Epic |
| `u5` | Legendary |

## Testing

```bash
npm install
npm run test
clarinet check
```

## Deployment

See root [README](../README.md) for deployment instructions.

---

**Clarity 4 | Nakamoto | Epoch 3.3**
