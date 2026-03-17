import { CHAIN_INFO } from '@cowprotocol/common-const'
import { isProdLike } from '@cowprotocol/common-utils'
import { CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

// https://dune.com/queries/6434876
export const AFFILIATE_SUPPORTED_CHAIN_IDS: readonly SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.GNOSIS_CHAIN,
  SupportedChainId.BASE,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.AVALANCHE,
  SupportedChainId.POLYGON,
  SupportedChainId.BNB,
  SupportedChainId.LINEA,
  // SupportedChainId.SEPOLIA,
  SupportedChainId.PLASMA,
] as const

export const TRADE_ENVS_TO_CHECK: CowEnv[] = ['prod', 'staging']
export const PAST_ORDERS_SCAN_LIMIT = 10

export const AFFILIATE_TRADER_SAVED_CODES_STORAGE_KEY = 'cowswap:affiliateTraderSavedCodes:v0'
export const AFFILIATE_TRADER_PAYOUT_CONFIRMATIONS_STORAGE_KEY = 'cowswap:affiliateTraderPayoutConfirmations:v0'

export const AFFILIATE_SUPPORTED_NETWORK_NAMES = AFFILIATE_SUPPORTED_CHAIN_IDS.map(
  (chainId) => CHAIN_INFO[chainId].label,
)

// TODO: replace placeholder URL once the referral docs are provisioned
export const AFFILIATE_HOW_IT_WORKS_URL = 'https://cow.fi/learn'
export const AFFILIATE_TERMS_URL = 'https://cow.fi/legal/affiliate-program-terms'

export const AFFILIATE_REWARDS_CURRENCY = 'USDC'
export const AFFILIATE_REWARDS_UPDATE_INTERVAL_HOURS = 6
export const AFFILIATE_REWARDS_UPDATE_LAG_HOURS = 1
export const AFFILIATE_REWARDS_UPDATE_INTERVAL_MS = ms`6h`
export const AFFILIATE_REWARDS_UPDATE_LAG_MS = ms`1h`
export const AFFILIATE_PAYOUTS_CHAIN_ID = SupportedChainId.MAINNET

export const VERIFICATION_DEBOUNCE_MS = 350
export const VERIFICATION_MIN_RESPONSE_DELAY_MS = 500
export const VERIFICATION_RETRY_DELAY_MS = 3_000

// Timeout applied to referral service requests so UI fails fast on network issues
export const AFFILIATE_API_TIMEOUT_MS = 10_000
export const AFFILIATE_ORDERBOOK_REFRESH_INTERVAL_MS = ms`5m`
export const AFFILIATE_STATS_REFRESH_INTERVAL_MS = ms`10m`
export const AFFILIATE_EXPIRY_CHECK_INTERVAL_MS = ms`1m`

export const AFFILIATE_HIDE_REWARDS_ROW_IF_INELIGIBLE = true

export const AFFILIATE_ELIGIBILITY_LOADING_WARNING_MS = ms`30s`

export const RATE_LIMIT_INTERVAL_MS = 200
export const BACKOFF_START_DELAY_MS = ms`1s`
export const BACKOFF_TIME_MULTIPLE = 3
export const BACKOFF_MAX_ATTEMPTS = 3

export const REF_CODE_PATTERN = /^[A-Z0-9_-]{5,20}$/
export const REF_CODE_MIN_LENGTH = 5
export const REF_CODE_MAX_LENGTH = 20

/**
 * Defaults params - keep them in sync with the cms env vars: `infrastructure/cms/index.ts`
 */
const PROGRAM_DEFAULTS_PROD = {
  AFFILIATE_REWARD_AMOUNT: 20,
  AFFILIATE_TRIGGER_VOLUME: 250_000,
  AFFILIATE_TIME_CAP_DAYS: 90,
  AFFILIATE_VOLUME_CAP: 50_000_000,
  AFFILIATE_REVENUE_SPLIT_AFFILIATE_PCT: 50,
  AFFILIATE_REVENUE_SPLIT_TRADER_PCT: 50,
  AFFILIATE_REVENUE_SPLIT_DAO_PCT: 0,
} as const

const PROGRAM_DEFAULTS_STAGING = {
  AFFILIATE_REWARD_AMOUNT: 2,
  AFFILIATE_TRIGGER_VOLUME: 10,
  AFFILIATE_TIME_CAP_DAYS: 1,
  AFFILIATE_VOLUME_CAP: 20,
  AFFILIATE_REVENUE_SPLIT_AFFILIATE_PCT: 33,
  AFFILIATE_REVENUE_SPLIT_TRADER_PCT: 33,
  AFFILIATE_REVENUE_SPLIT_DAO_PCT: 34,
} as const

export const PROGRAM_DEFAULTS = isProdLike ? PROGRAM_DEFAULTS_PROD : PROGRAM_DEFAULTS_STAGING
