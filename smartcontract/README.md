# Stacks Arena — Smart Contracts

Clarity smart contracts for the **Stacks Arena** protocol, providing Bitcoin-native commitment vaults on the Stacks L2.

## 🏗 Architecture

The protocol is composed of three primary layers:

### 1. `VaultFactory.clar`
The entry point for the protocol. It handles the deployment of individual user vaults and tracks global protocol statistics (Total Value Locked, total vaults created).

### 2. `CommitVault.clar`
The core logic contract for each commitment. It stores the locked STX/assets and enforces the rules defined by the user (Time-locks, Penalty-locks, etc.).

### 3. `ConditionEngine.clar`
A standalone engine used to evaluate whether unlock conditions have been met. It abstracts the complexity of rule evaluation from the vault contracts.

## 🚀 Mainnet Deployment

The protocol is live on Stacks Mainnet.

| Contract | Address |
|----------|---------|
| **CommitVault** | `SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-CommitVault` |
| **VaultFactory** | `SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-VaultFactory` |
| **ConditionEngine** | `SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-ConditionEngine` |
| **SIP-010 Trait** | `SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-sip-010-trait` |

---

## 🔒 Security

- **Immutability**: Once a vault is created and locked, its conditions cannot be changed by any party, including the protocol developers.
- **Clarity 4**: Leverages the decidability of Clarity to prevent unexpected state changes or reentrancy.
- **Bitcoin Settlement**: All contract states are eventually settled on the Bitcoin blockchain via the Stacks PoX mechanism.

## 🛠 Development

### Requirements
- [Clarinet](https://github.com/hirosystems/clarinet)
- [Node.js](https://nodejs.org/)

### Commands
```bash
# Test contracts
clarinet test

# Check syntax
clarinet check

# Deploy to Devnet
clarinet deploy
```

## 📜 License
This project is licensed under the MIT License.
