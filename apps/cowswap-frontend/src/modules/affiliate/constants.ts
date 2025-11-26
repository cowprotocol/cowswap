import { AFFILIATE_SUPPORTED_CHAIN_IDS, CHAIN_INFO } from '@cowprotocol/common-const'

import { defineMessage } from '@lingui/core/macro'

export const REFERRAL_STORAGE_KEY = 'cowswap:referral-code:v1'
export const REFERRAL_SOURCE_STORAGE_KEY = 'cowswap:referral-source:v1'

export const REFERRAL_SUPPORTED_NETWORKS = AFFILIATE_SUPPORTED_CHAIN_IDS

export const REFERRAL_SUPPORTED_NETWORK_NAMES = AFFILIATE_SUPPORTED_CHAIN_IDS.map(
  (chainId) => CHAIN_INFO[chainId].label,
)

export const REFERRAL_PROGRAM_RULES_COPY = defineMessage({
  id: 'affiliate.referral.program.rules',
  message: 'Earn 10 USDC per 50k eligible volume in 90 days.',
  comment: 'Explains how much a referrer earns for referred trading volume within 90 days.',
})

// TODO: replace placeholder URL once the referral API endpoint is provisioned
export const DEFAULT_REFERRAL_API_URL = 'https://affiliate.api.cow.fi'

// Timeout applied to referral service requests so UI fails fast on network issues
export const REFERRAL_API_TIMEOUT_MS = 10_000

// TODO: replace placeholder URL once the referral docs are provisioned
export const REFERRAL_HOW_IT_WORKS_URL = 'https://docs.cow.fi'
