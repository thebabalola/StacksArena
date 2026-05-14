# Stacks Arena — Frontend Integration Guide

> A developer reference for connecting the StacksArena Next.js frontend to the Clarity smart contracts using `@stacks/connect` and `@stacks/transactions`.

---

## Setup

### Prerequisites
- Node.js 18+
- Leather or Xverse wallet installed in browser
- `@stacks/connect`, `@stacks/transactions`, `@stacks/network` installed

### Environment Variables
Create a `.env.local` file in the `frontend/` directory:
```bash
NEXT_PUBLIC_STACKS_ENV=mainnet
NEXT_PUBLIC_DEPLOYER=SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2
```

---

## Contract Addresses

All contract addresses and function name constants are in:
`frontend/lib/constants/contracts.ts`

```ts
import { CONTRACTS, COMMIT_VAULT_FUNCTIONS } from '@/lib/constants/contracts';

// e.g.
// CONTRACTS.COMMIT_VAULT => "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.CommitVault"
```

---

## 1. Creating a Vault

Call `create-vault` using `openContractCall`. Amounts are in **microSTX** (1 STX = 1,000,000 microSTX).

```ts
import { openContractCall } from '@stacks/connect';
import { uintCV, AnchorMode, PostConditionMode } from '@stacks/transactions';
import { CONTRACTS, COMMIT_VAULT_FUNCTIONS } from '@/lib/constants/contracts';
import { STACKS_NETWORK_CONFIG } from '@/lib/constants/contracts';

async function createVault(
  amountMicroStx: bigint,  // supports micro-units e.g. 1n = 0.000001 STX
  targetBlock: bigint,
  penaltyRate: bigint,     // 0-100 (percent)
  threshold: bigint        // 1 = single-sig, 2+ = multi-sig
) {
  const [contractAddress, contractName] = CONTRACTS.COMMIT_VAULT.split('.');

  await openContractCall({
    contractAddress,
    contractName,
    functionName: COMMIT_VAULT_FUNCTIONS.CREATE_VAULT,
    functionArgs: [
      uintCV(amountMicroStx),
      uintCV(targetBlock),
      uintCV(penaltyRate),
      uintCV(threshold),
    ],
    network: STACKS_NETWORK_CONFIG as any,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => console.log('Vault created! txId:', data.txId),
    onCancel: () => console.log('Transaction cancelled'),
  } as any);
}
```

> **Micro-unit support**: The contract accepts any `uint` value ≥ 1. You can lock `1` microSTX (0.000001 STX) or any fraction thereof.

---

## 2. Reading Vault Details

Use `callReadOnlyFn` from `@stacks/transactions` for read-only calls — no wallet needed.

```ts
import { callReadOnlyFn, uintCV, cvToJSON } from '@stacks/transactions';
import { STACKS_NETWORK_CONFIG, CONTRACTS, COMMIT_VAULT_FUNCTIONS } from '@/lib/constants/contracts';

async function getVaultDetails(vaultId: bigint) {
  const [contractAddress, contractName] = CONTRACTS.COMMIT_VAULT.split('.');

  const result = await callReadOnlyFn(
    contractAddress,
    contractName,
    COMMIT_VAULT_FUNCTIONS.GET_VAULT_DETAILS,
    [uintCV(vaultId)],
    contractAddress, // caller
    STACKS_NETWORK_CONFIG as any
  );

  const json = cvToJSON(result);
  // json.value contains: owner, balance, lock-start, target-block,
  //                       penalty-rate, threshold, approval-count, is-active
  return json;
}
```

---

## 3. Submitting a Multi-Sig Approval

Any address can submit an approval for a multi-sig vault. The vault unlocks once `approval-count >= threshold`.

```ts
async function approveVault(vaultId: bigint) {
  const [contractAddress, contractName] = CONTRACTS.COMMIT_VAULT.split('.');

  await openContractCall({
    contractAddress,
    contractName,
    functionName: COMMIT_VAULT_FUNCTIONS.APPROVE_VAULT,
    functionArgs: [uintCV(vaultId)],
    network: STACKS_NETWORK_CONFIG as any,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => console.log('Approval submitted! txId:', data.txId),
    onCancel: () => console.log('Cancelled'),
  } as any);
}
```

---

## 4. Withdrawing from a Vault

The `withdraw` function handles both scenarios automatically:
- **Full unlock** (time reached + multi-sig met) → sends 100% to owner
- **Early unlock** (penalty-rate > 0) → deducts penalty, sends remainder to owner

```ts
async function withdraw(vaultId: bigint) {
  const [contractAddress, contractName] = CONTRACTS.COMMIT_VAULT.split('.');

  await openContractCall({
    contractAddress,
    contractName,
    functionName: COMMIT_VAULT_FUNCTIONS.WITHDRAW,
    functionArgs: [uintCV(vaultId)],
    network: STACKS_NETWORK_CONFIG as any,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => console.log('Withdrawal complete! txId:', data.txId),
    onCancel: () => console.log('Cancelled'),
  } as any);
}
```

---

## 5. Checking Approval Status

```ts
import { callReadOnlyFn, uintCV, standardPrincipalCV, cvToValue } from '@stacks/transactions';

async function getApprovalStatus(vaultId: bigint, approver: string): Promise<boolean> {
  const [contractAddress, contractName] = CONTRACTS.COMMIT_VAULT.split('.');

  const result = await callReadOnlyFn(
    contractAddress,
    contractName,
    COMMIT_VAULT_FUNCTIONS.GET_APPROVAL_STATUS,
    [uintCV(vaultId), standardPrincipalCV(approver)],
    contractAddress,
    STACKS_NETWORK_CONFIG as any
  );

  return cvToValue(result) as boolean;
}
```

---

## 6. Error Handling

Clarity functions return structured errors. Map them in your UI:

```ts
const VAULT_ERRORS: Record<number, string> = {
  401: 'Unauthorized — you are not the vault owner',
  403: 'Vault is locked — conditions not met for withdrawal',
  404: 'Vault not found or already closed',
  409: 'You have already submitted your approval',
  400: 'Invalid parameters — check amount, target block, and penalty rate',
};
```

---

## 7. Block Height Conversions

Stacks blocks are mined approximately every **~10 minutes** (anchored to Bitcoin).

```ts
// Calculate target block for N days from now
function blockHeightInDays(currentBlock: number, days: number): number {
  const blocksPerDay = Math.floor((24 * 60) / 10); // ~144 blocks/day
  return currentBlock + (days * blocksPerDay);
}
```

---

## Architecture Summary

```
User Action (UI)
    ↓
openContractCall (@stacks/connect)
    ↓
Leather / Xverse Wallet (signs tx)
    ↓
Stacks Network (broadcasts)
    ↓
CommitVault.clar (executes Clarity logic)
    ↓
Bitcoin L1 (settlement / anchoring)
```

---

*Built by thebabalola · Secured by Bitcoin · Built on Stacks*
