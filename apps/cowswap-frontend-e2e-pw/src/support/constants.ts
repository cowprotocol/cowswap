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

export const SEPOLIA_RPC_URL_ENV = 'REACT_APP_NETWORK_URL_11155111'
