import { useMemo } from 'react'

import { TraderEligibilityStatus, useAffiliateTraderEligibility } from './useAffiliateTraderEligibility'

import { isSupportedReferralNetwork } from '../lib/affiliateProgramUtils'

interface UseAffiliateTraderWalletParams {
  account?: string
  chainId?: number
  savedCode?: string
}

export enum TraderWalletStatus {
  UNKNOWN = 'unknown',
  DISCONNECTED = 'disconnected',
  UNSUPPORTED = 'unsupported',
  ELIGIBLE = 'eligible',
  LINKED = 'linked',
  INELIGIBLE = 'ineligible',
  ELIGIBILITY_UNKNOWN = 'eligibility-unknown',
}

interface UseAffiliateTraderWalletResult {
  walletStatus: TraderWalletStatus
  linkedCode?: string
  supportedNetwork: boolean
  eligibilityStatus: TraderEligibilityStatus
  hasLoadingTimeout: boolean
}

export function useAffiliateTraderWallet(params: UseAffiliateTraderWalletParams): UseAffiliateTraderWalletResult {
  const { account, chainId, savedCode } = params
  const supportedNetwork = chainId === undefined ? true : isSupportedReferralNetwork(chainId)
  const { status: eligibilityStatus, hasLoadingTimeout } = useAffiliateTraderEligibility({
    account,
    enabled: Boolean(account && supportedNetwork),
  })

  const { walletStatus, linkedCode } = useMemo(() => {
    if (!account) {
      return { walletStatus: TraderWalletStatus.DISCONNECTED, linkedCode: undefined }
    }

    if (!supportedNetwork) {
      return { walletStatus: TraderWalletStatus.UNSUPPORTED, linkedCode: undefined }
    }

    if (hasLoadingTimeout || eligibilityStatus === TraderEligibilityStatus.ERROR) {
      return { walletStatus: TraderWalletStatus.ELIGIBILITY_UNKNOWN, linkedCode: undefined }
    }

    if (eligibilityStatus === TraderEligibilityStatus.HAS_PAST_TRADES) {
      return savedCode
        ? { walletStatus: TraderWalletStatus.LINKED, linkedCode: savedCode }
        : { walletStatus: TraderWalletStatus.INELIGIBLE, linkedCode: undefined }
    }

    if (eligibilityStatus === TraderEligibilityStatus.NO_PAST_TRADES) {
      return { walletStatus: TraderWalletStatus.ELIGIBLE, linkedCode: undefined }
    }

    return { walletStatus: TraderWalletStatus.UNKNOWN, linkedCode: undefined }
  }, [account, eligibilityStatus, hasLoadingTimeout, savedCode, supportedNetwork])

  return {
    walletStatus,
    linkedCode,
    supportedNetwork,
    eligibilityStatus,
    hasLoadingTimeout,
  }
}
