// StacksArena Contract Addresses — Deployed on Stacks Mainnet
// Deployer: SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2
//
// Deployment TxIDs:
//   StacksArena-game-assets:        0fe531cad9ef34702ecd18b1cc295489a591eeddfd79dd97595348a555dc7236
//   StacksArena-lottery-pool:       9bbb6920df9a29eaa26d6f0c3ca95271289470f79854f1720de5bc5a51b7b60f
//   StacksArena-tournament-manager: ad3131685ddc27b310e6e74c9403dc60933a684ae9b713cc108af832bc094847

export const CONTRACTS = {
  LOTTERY_POOL: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.StacksArena-lottery-pool",
  TOURNAMENT_MANAGER: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.StacksArena-tournament-manager",
  GAME_ASSETS: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2.StacksArena-game-assets",
} as const;

export const STACKS_NETWORK_CONFIG = {
  chainId: 1, // Mainnet
  coreApiUrl: "https://api.hiro.so",
} as const;

export const PLATFORM_CONFIG = {
  name: "StacksArena",
  tagline: "Bitcoin Gaming Arena",
  version: "1.0.0",
  deployer: "SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2",
} as const;
