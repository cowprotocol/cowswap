import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

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
  // SupportedChainId.SEPOLIA,
  SupportedChainId.PLASMA,
] as const

export const AFFILIATE_TRADER_STORAGE_KEY = 'cowswap:affiliateTrader:v3'
export const AFFILIATE_PAYOUT_ADDRESS_CONFIRMATION_STORAGE_KEY = 'cowswap:affiliatePayoutAddressConfirmation:v0'

export const AFFILIATE_SUPPORTED_NETWORK_NAMES = AFFILIATE_SUPPORTED_CHAIN_IDS.map(
  (chainId) => CHAIN_INFO[chainId].label,
)

// TODO: replace placeholder URL once the referral docs are provisioned
export const AFFILIATE_HOW_IT_WORKS_URL = 'https://docs.cow.fi'
export const AFFILIATE_TERMS_URL = 'https://cow.fi/legal/affiliate-program-terms'

export const AFFILIATE_REWARDS_CURRENCY = 'USDC'
export const AFFILIATE_REWARDS_UPDATE_INTERVAL_HOURS = 6
export const AFFILIATE_REWARDS_UPDATE_LAG_HOURS = 1
export const AFFILIATE_PAYOUT_HISTORY_CHAIN_ID = SupportedChainId.MAINNET

export const VERIFICATION_DEBOUNCE_MS = 350
export const VERIFICATION_RETRY_DELAY_MS = 3_000

// Timeout applied to referral service requests so UI fails fast on network issues
export const AFFILIATE_API_TIMEOUT_MS = 10_000

export const AFFILIATE_HIDE_REWARDS_ROW_IF_INELIGIBLE = true

export const AFFILIATE_ELIGIBILITY_LOADING_WARNING_MS = ms`30s`

export const RATE_LIMIT_INTERVAL_MS = 200
export const BACKOFF_START_DELAY_MS = ms`1s`
export const BACKOFF_TIME_MULTIPLE = 3
export const BACKOFF_MAX_ATTEMPTS = 3

enum RetryableStatusCode {
  RequestTimeout = 408,
  TooEarly = 425,
  TooManyRequests = 429,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
}

export const STATUS_CODES_TO_RETRY: number[] = Object.values(RetryableStatusCode).filter(
  (value): value is number => typeof value === 'number',
)
