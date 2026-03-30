```
  ____  _             _      _    ___
 / ___|| |_ __ _  ___| | __ / \  |_ _|
 \___ \| __/ _` |/ __| |/ // _ \  | |
  ___) | || (_| | (__|   </ ___ \ | |
 |____/ \__\__,_|\___|_|\_/_/   \_\___|
```

# StacksArena

> **The Bitcoin-anchored gaming arena. Compete. Win. Dominate.**

[![Stacks](https://img.shields.io/badge/Stacks-L2-blue)](https://stacks.co)
[![Bitcoin](https://img.shields.io/badge/Secured_by-Bitcoin-orange)](https://bitcoin.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## What is StacksArena?

StacksArena is a decentralized gaming platform built on **Stacks L2**, secured by Bitcoin. Players can:

- **Compete in tournaments** with STX entry fees and automatic prize distribution
- **Buy lottery tickets** with provably fair randomness derived from Bitcoin block hashes
- **Mint game assets** with XP, levels, and rarity tiers — true on-chain ownership

Every game, every bet, every mint — all anchored to the Bitcoin blockchain.

---

## Live Contracts (Mainnet)

| Contract | Address |
|----------|---------|
| Lottery Pool | `SPZYY7560...Y8K0TST365B2.StacksArena-lottery-pool` |
| Tournament Manager | `SPZYY7560...Y8K0TST365B2.StacksArena-tournament-manager` |
| Game Assets | `SPZYY7560...Y8K0TST365B2.StacksArena-game-assets` |

---

## Features

### 🏆 Tournament Arena
Enter skill-based tournaments. Pay the entry fee, compete against other players, and the top scorers split the prize pool automatically — no middleman, no trust required.

### 🎰 Lottery Pool
Buy tickets for provably fair lottery rounds. The winner is drawn using Bitcoin block hashes as entropy — even the contract deployer cannot manipulate the outcome.

### ⚔️ Game Assets
Mint on-chain game items with configurable attributes:
- **Power**, **Defense**, **Speed** stats
- **Rarity** tiers: Common → Legendary
- **XP** and **Level** progression
- **Fuse** assets to create legendary items

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Clarity 4 on Stacks L2 |
| Frontend | Next.js 16 + TypeScript |
| Styling | Tailwind CSS 4 + Orbitron font |
| Wallet | Leather / Xverse via @stacks/connect |
| Network | Stacks Mainnet |

---

## Getting Started

```bash
# Clone
git clone https://github.com/thebabalola/StacksArena.git
cd StacksArena/frontend

# Install
npm install

# Develop
npm run dev

# Build
npm run build --webpack
```

---

## Architecture

```
StacksArena/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── page.tsx          # Landing page (real on-chain stats)
│   │   ├── arena/page.tsx    # Tournament listing + join
│   │   ├── lottery/page.tsx  # Buy tickets + platform stats
│   │   └── assets/page.tsx   # Game asset gallery
│   └── lib/
│       ├── hooks/use-contract.ts  # Contract read/write hooks
│       └── constants/contracts.ts # Mainnet addresses
└── smartcontract/             # Clarity contracts
    ├── lottery-pool.clar
    ├── tournament-manager.clar
    └── game-assets.clar
```

---

## Author

Built and maintained by **thebabalola**.

---

## License

MIT

---

<p align="center">
  <strong>Secured by Bitcoin · Built on Stacks · Powered by Clarity</strong>
</p>
