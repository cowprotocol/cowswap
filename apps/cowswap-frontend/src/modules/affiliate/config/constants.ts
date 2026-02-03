import { AFFILIATE_SUPPORTED_CHAIN_IDS, CHAIN_INFO } from '@cowprotocol/common-const'

export const AFFILIATE_TRADER_STORAGE_KEY = 'cowswap:affiliate-trader:v2'

export const AFFILIATE_SUPPORTED_NETWORK_NAMES = AFFILIATE_SUPPORTED_CHAIN_IDS.map(
  (chainId) => CHAIN_INFO[chainId].label,
)

// Timeout applied to referral service requests so UI fails fast on network issues
export const AFFILIATE_API_TIMEOUT_MS = 10_000

// TODO: replace placeholder URL once the referral docs are provisioned
export const AFFILIATE_HOW_IT_WORKS_URL = 'https://docs.cow.fi'

export const AFFILIATE_REWARDS_CURRENCY = 'USDC'
