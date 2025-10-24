import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const REFERRAL_STORAGE_KEY = 'cowswap:referral-code:v1'
export const REFERRAL_SOURCE_STORAGE_KEY = 'cowswap:referral-source:v1'

export const REFERRAL_SUPPORTED_NETWORKS: SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.BASE,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.GNOSIS_CHAIN,
  SupportedChainId.LENS,
  SupportedChainId.SEPOLIA,
]

export const REFERRAL_SUPPORTED_NETWORK_NAMES = REFERRAL_SUPPORTED_NETWORKS.map(
  (chainId) => CHAIN_INFO[chainId].label,
)

export const REFERRAL_PROGRAM_RULES_COPY = 'Earn 10 USDC per 50k eligible volume in 90 days.'

export const DEFAULT_REFERRAL_API_URL = 'https://affiliate.api.cow.fi'

export const REFERRAL_API_TIMEOUT_MS = 25_000

export const REFERRAL_HOW_IT_WORKS_URL =
  process.env.REACT_APP_REFERRAL_HOW_IT_WORKS_URL || 'https://cow.fi/cow-swap/how-it-works'
