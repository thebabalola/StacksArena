# StacksArena

> **Bitcoin-Native Financial Commitment Protocol. Commitment savings product for Bitcoin holders.**

[![Stacks](https://img.shields.io/badge/Stacks-L2-blue)](https://stacks.co)
[![Bitcoin](https://img.shields.io/badge/Secured_by-Bitcoin-orange)](https://bitcoin.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## The Problem
Bitcoin is the ultimate store of value, but traditional self-custody offers no friction against impulsive spending. Users often struggle to enforce financial discipline on themselves, lacking a way to mathematically lock their assets away with strict, programmable penalties for early withdrawal.

## The Solution
**StacksArena** is a decentralized, Bitcoin-native vault protocol built on Stacks L2. It acts as a commitment savings product for Bitcoin holders. By locking STX into programmable vaults with time-locks, early-exit penalties, multi-sig thresholds, and phased milestone unlocks, StacksArena enforces pure financial discipline on-chain.

## How it Works
Users lock their assets into a smart contract vault. They define strict commitments such as:
1. **Time-Locked Vaults**: Secure BTC/STX until a specific target is reached.
2. **Penalty-Based Unlocks**: Imposing a penalty for premature access to ensure financial goals stay on track.
3. **Multi-Signature Conditions**: Require collective approval for asset release (e.g., escrow or joint savings).
4. **Milestone-Based Release**: Automate fund distribution based on specific goals.

The protocol ensures that funds remain locked and governed by immutable Clarity smart contract logic, anchored to the security of the Bitcoin blockchain.

## Live Contract Links (Stacks Mainnet)
- **CommitVault**: [`SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-CommitVaults-fix`](https://explorer.stacks.co/txid/SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-CommitVaults-fix?chain=mainnet)
- **VaultFactory**: [`SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-VaultFactory-fix`](https://explorer.stacks.co/txid/SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-VaultFactory-fix?chain=mainnet)
- **ConditionEngine**: [`SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-ConditionEngine-fix`](https://explorer.stacks.co/txid/SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-ConditionEngine-fix?chain=mainnet)
- **SIP-010 Trait**: [`SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-sip-010-trait-fix`](https://explorer.stacks.co/txid/SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-sip-010-trait-fix?chain=mainnet)

## Roadmap
- **Phase 1 (Live)**: Core vaults with block-height-based time-locks and early exit penalties.
- **Phase 2 (Next)**: sBTC Integration to allow users to lock Bitcoin directly as sBTC. Upgrade to Clarity 4 / Nakamoto to replace block-height time-locks with `stacks-block-time`.
- **Phase 3 (Future)**: Security audit and community expansion for mass adoption among Bitcoin holders.
