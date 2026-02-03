import { AFFILIATE_SUPPORTED_CHAIN_IDS, BFF_BASE_URL } from '@cowprotocol/common-const'

import { BffAffiliateApi } from './bffAffiliateApi'

import { AFFILIATE_API_TIMEOUT_MS } from '../config/constants'

export const bffAffiliateApi = new BffAffiliateApi(BFF_BASE_URL, AFFILIATE_API_TIMEOUT_MS)

export function isSupportedReferralNetwork(chainId: number | undefined | null): boolean {
  if (!chainId) {
    return false
  }

  return AFFILIATE_SUPPORTED_CHAIN_IDS.includes(chainId as number)
}
