// StacksArena Contract Addresses
// Deployer: SPZYY7560YPR8BY63XNTDX36HBY1G8K0TST365B2
// Update status: awaiting mainnet deployment confirmation
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
