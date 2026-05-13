# Stacks Arena — Frontend

This is the web interface for the **Stacks Arena** protocol, allowing users to create, monitor, and manage Bitcoin-native commitment vaults.

## 🚀 Features

- **Vault Creation**: Interactive wizard to define lock durations, penalty rates, and approval conditions.
- **Dashboard**: Real-time view of all active vaults, including time remaining and unlock status.
- **Wallet Integration**: Seamless connection with Leather and Xverse wallets.
- **Transaction History**: On-chain history of locks, approvals, and withdrawals.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Wallet**: [@stacks/connect](https://github.com/hirosystems/connect)
- **Library**: [Viem](https://viem.sh/) & [Wagmi](https://wagmi.sh/) (where applicable for cross-chain data)

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_NETWORK=mainnet
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components (Vault cards, forms, etc.).
- `/lib/hooks`: Custom React hooks for interacting with the Stacks blockchain.
- `/lib/constants`: Contract addresses and ABIs.

## 🔗 Protocol Integration

The frontend interacts with the following Stacks Arena core contracts:
- `VaultFactory`: For deploying new user vaults.
- `ConditionEngine`: For calculating unlock eligibility.
