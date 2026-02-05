import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

// // https://dune.com/discover/blockchains/popular
// const UNSUPPORTED_DUNE_CHAIN_IDS: readonly SupportedChainId[] = [
//   SupportedChainId.SEPOLIA,
//   SupportedChainId.LENS,
// ] as const

// const UNSUPPORTED_DUNE_CHAIN_IDS_SET: ReadonlySet<SupportedChainId> = new Set(UNSUPPORTED_DUNE_CHAIN_IDS)

// export const AFFILIATE_SUPPORTED_CHAIN_IDS: readonly SupportedChainId[] = ALL_SUPPORTED_CHAIN_IDS.filter(
//   (chainId) => !UNSUPPORTED_DUNE_CHAIN_IDS_SET.has(chainId),
// )

// https://dune.com/queries/6434876
export const AFFILIATE_SUPPORTED_CHAIN_IDS: readonly SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.GNOSIS_CHAIN,
  SupportedChainId.BASE,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.AVALANCHE,
  SupportedChainId.POLYGON,
  SupportedChainId.LENS,
  SupportedChainId.BNB,
  SupportedChainId.LINEA,
  SupportedChainId.SEPOLIA,
  SupportedChainId.PLASMA,
] as const

export const AFFILIATE_TRADER_STORAGE_KEY = 'cowswap:affiliate-trader:v2'

export const AFFILIATE_SUPPORTED_NETWORK_NAMES = AFFILIATE_SUPPORTED_CHAIN_IDS.map(
  (chainId) => CHAIN_INFO[chainId].label,
)

// Timeout applied to referral service requests so UI fails fast on network issues
export const AFFILIATE_API_TIMEOUT_MS = 10_000

// TODO: replace placeholder URL once the referral docs are provisioned
export const AFFILIATE_HOW_IT_WORKS_URL = 'https://docs.cow.fi'

export const AFFILIATE_REWARDS_CURRENCY = 'USDC'
