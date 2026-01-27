import { AFFILIATE_SUPPORTED_CHAIN_IDS, CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const REFERRAL_STORAGE_KEY = 'cowswap:referral-code:v3'
export const REFERRAL_SOURCE_STORAGE_KEY = 'cowswap:referral-source:v3'

export const REFERRAL_SUPPORTED_NETWORKS: SupportedChainId[] = [...AFFILIATE_SUPPORTED_CHAIN_IDS]

export const REFERRAL_SUPPORTED_NETWORK_NAMES = REFERRAL_SUPPORTED_NETWORKS.map((chainId) => CHAIN_INFO[chainId].label)

// Timeout applied to referral service requests so UI fails fast on network issues
export const REFERRAL_API_TIMEOUT_MS = 10_000

// TODO: replace placeholder URL once the referral docs are provisioned
export const REFERRAL_HOW_IT_WORKS_URL = 'https://docs.cow.fi'
