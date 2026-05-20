```
  ____  _             _      _    ___
 / ___|| |_ __ _  ___| | __ / \  |_ _|
 \___ \| __/ _` |/ __| |/ // _ \  | |
  ___) | || (_| | (__|   </ ___ \  | |
 |____/ \__\__,_|\___|_|\_/_/   \_\___|
```

# Stacks Arena

> **The Bitcoin-native commitment protocol. Lock. Commit. Grow.**

[![Stacks](https://img.shields.io/badge/Stacks-L2-blue)](https://stacks.co)
[![Bitcoin](https://img.shields.io/badge/Secured_by-Bitcoin-orange)](https://bitcoin.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## What is Stacks Arena?

**Stacks Arena** is a decentralized, Bitcoin-native vault protocol built on **Stacks L2**. It enables users to transform Bitcoin into enforceable financial behavior by locking funds under programmable rules.

Users can define commitments such as:
- **Time-Locked Vaults**: Secure BTC until a specific future date.
- **Penalty-Based Unlocks**: Enforce discipline by imposing a penalty for premature access.
- **Multi-Signature Conditions**: Require collective approval for asset release.
- **Milestone-Based Release**: Automate fund distribution based on specific goals.

Every commitment is governed by immutable smart contract logic, anchored to the security of the Bitcoin blockchain.

---

## Protocol Architecture

| Component | Responsibility |
|----------|---------|
| **Vault Factory** | Orchestrates the creation of individual vault instances. |
| **Commit Vault** | Manages the locking, rules, and withdrawal logic for assets. |
| **Condition Engine** | Evaluates unlock triggers and enforces behavior-based rules. |

---

## 🚀 Deployment Status

**Mainnet Status**: ✅ **Live on Stacks Mainnet**

The protocol is deployed to **Stacks Mainnet** with the following contracts (Deployer: `SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2`):
- **CommitVault**: `stacksarena-CommitVault`
- **VaultFactory**: `stacksarena-VaultFactory`
- **ConditionEngine**: `stacksarena-ConditionEngine`
- **SIP-010 Trait**: `stacksarena-sip-010-trait`

You can verify these contracts on the [Stacks Explorer](https://explorer.stacks.co/address/SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2?chain=mainnet).


---

## Core Features

### ⏳ Time-Locked Vaults
Lock your BTC for the long term. The protocol ensures funds remain untouched until the target block height or timestamp is reached, preventing impulsive spending.

### ⚖️ Penalty-Based Discipline
Create high-stakes commitments. If you choose to unlock funds before conditions are met, a predefined penalty is incurred, ensuring your financial goals stay on track.

### 🛡️ Multi-Sig Agreements
Establish trustless partnerships. Funds are only released when a threshold of participants provides digital signatures, perfect for business escrow and joint savings.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contracts** | Clarity 4 on Stacks L2 |
| **Frontend** | Next.js 16 + TypeScript |
| **Styling** | Tailwind CSS 4 + Orbitron font |
| **Wallet Integration** | Leather / Xverse via @stacks/connect |
| **Security Layer** | Bitcoin (POX / Settlement) |

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
```

---

## Repository Structure

```
StacksArena/
├── frontend/                  # Next.js Application
│   ├── app/                  # UI Components and Pages
│   └── lib/                  # Stacks & Contract Hooks
├── smartcontract/             # Clarity Smart Contracts
│   ├── contracts/            # Vault & Logic Contracts
│   └── tests/                # Security & Functional Tests
└── todo.md                    # Development Roadmap
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
 
