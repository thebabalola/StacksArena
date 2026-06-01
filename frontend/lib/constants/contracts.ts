// StacksArena Contract Addresses
// Deployer: SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2

import { STACKS_MAINNET } from "@stacks/network";

export const CONTRACTS = {
  VAULT_FACTORY: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-VaultFactory-fix",
  COMMIT_VAULT: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-CommitVaults-fix",
  CONDITION_ENGINE: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-ConditionEngine-fix",
  SIP010_TRAIT: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.stacksarena-sip-010-trait-fix",
} as const;

export const STACKS_NETWORK_CONFIG = {
  ...STACKS_MAINNET,
  baseUrl: STACKS_MAINNET.client.baseUrl,
};

export const PLATFORM_CONFIG = {
  name: "StacksArena",
  tagline: "Bitcoin Commitment Protocol",
  version: "1.0.0",
  deployer: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2",
} as const;

// ===== CommitVault Function Names (ABI) =====
// Used as the `functionName` argument in openContractCall / callReadOnlyFn
export const COMMIT_VAULT_FUNCTIONS = {
  // --- Public (write) ---
  CREATE_VAULT: "create-vault",       // (amount uint) (target-block uint) (penalty-rate uint) (threshold uint)
  APPROVE_VAULT: "approve-vault",     // (vault-id uint) — submit multi-sig approval
  WITHDRAW: "withdraw",               // (vault-id uint) — full or early withdrawal
  SET_TREASURY: "set-treasury",       // (new-treasury principal) — admin only

  // --- Read-only ---
  GET_VAULT_DETAILS: "get-vault-details",     // (vault-id uint) -> (optional vault-tuple)
  GET_APPROVAL_STATUS: "get-approval-status", // (vault-id uint) (approver principal) -> bool
  GET_TREASURY: "get-treasury",               // () -> principal
} as const;

// ===== VaultFactory Function Names =====
export const VAULT_FACTORY_FUNCTIONS = {
  TRACK_NEW_VAULT: "track-new-vault",     // (amount uint)
  GET_PROTOCOL_STATS: "get-protocol-stats", // () -> { total-vaults, total-locked }
} as const;

// ===== ConditionEngine Function Names =====
export const CONDITION_ENGINE_FUNCTIONS = {
  EVALUATE_TIME_LOCK: "evaluate-time-lock",   // (target-block uint) -> bool
  IS_PENALTY_PERIOD: "is-penalty-period",     // (lock-start uint) (duration uint) -> bool
  EVALUATE_MULTISIG: "evaluate-multisig",     // (signatures-count uint) (threshold uint) -> bool
  EVALUATE_MILESTONE: "evaluate-milestone",   // (current-milestone uint) (total-milestones uint) -> bool
} as const;

