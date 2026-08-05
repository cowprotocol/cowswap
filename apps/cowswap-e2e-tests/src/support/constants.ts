export const CHAIN_IDS = {
  MAINNET: 1,
  GNOSIS: 100,
  BNB: 56,
  ARBITRUM: 42161,
  BASE: 8453,
  SEPOLIA: 11155111,
} as const

export type SupportedChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS]

export const RPC_PROXY_PORT_ENV = 'E2E_RPC_PROXY_PORT'

// The port is baked into the cached MetaMask profile at cache-build time (the wallet
// setup function does NOT re-run when tests start — the profile is copied verbatim),
// so it must be deterministic and identical for `e2e:build-cache` and test runs.
export const DEFAULT_RPC_PROXY_PORT = 18545

export const SEPOLIA_RPC_URL_ENV = 'REACT_APP_NETWORK_URL_11155111'
