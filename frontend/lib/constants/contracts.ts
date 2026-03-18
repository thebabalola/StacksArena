// StacksGuard Contract Addresses
// Dummy addresses — update these after mainnet deployment
export const CONTRACTS = {
  LOTTERY_POOL: "SP1STACKSGUARD000000000000000000000.lottery-pool",
  TOURNAMENT_MANAGER: "SP1STACKSGUARD000000000000000000000.tournament-manager",
  GAME_ASSETS: "SP1STACKSGUARD000000000000000000000.game-assets",
} as const;

export const STACKS_NETWORK_CONFIG = {
  chainId: 1, // Mainnet
  coreApiUrl: "https://api.hiro.so",
} as const;

export const PLATFORM_CONFIG = {
  name: "StacksGuard",
  tagline: "Bitcoin Gaming Arena",
  version: "1.0.0",
  deployer: "SP1STACKSGUARD000000000000000000000",
} as const;
