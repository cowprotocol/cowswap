import { BffAffiliateApi } from './bffAffiliateApi'

import { REFERRAL_API_BASE_URL, REFERRAL_API_TIMEOUT_MS, REFERRAL_SUPPORTED_NETWORKS } from '../config/constants'

export const bffAffiliateApi = new BffAffiliateApi(REFERRAL_API_BASE_URL, REFERRAL_API_TIMEOUT_MS)

export function isSupportedReferralNetwork(chainId: number | undefined | null): boolean {
  if (!chainId) {
    return false
  }

  return REFERRAL_SUPPORTED_NETWORKS.includes(chainId as number)
}
