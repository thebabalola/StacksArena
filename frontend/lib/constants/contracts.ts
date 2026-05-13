// StacksArena Contract Addresses
// Deployer: SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2

import { STACKS_MAINNET } from "@stacks/network";

export const CONTRACTS = {
  VAULT_FACTORY: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.VaultFactory",
  COMMIT_VAULT: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.CommitVault",
  CONDITION_ENGINE: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.ConditionEngine",
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
