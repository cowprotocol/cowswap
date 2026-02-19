import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { TraderEligibilityStatus, useAffiliateTraderEligibility } from './useAffiliateTraderEligibility'

import { isSupportedTradingNetwork } from '../lib/affiliateProgramUtils'
import { affiliateTraderAtom } from '../state/affiliateTraderAtom'

export enum TraderWalletStatus {
  // Eligibility check is still resolving.
  PENDING = 'pending',
  // No wallet is connected.
  DISCONNECTED = 'disconnected',
  // Connected wallet is on a chain where affiliate program is not supported.
  UNSUPPORTED = 'unsupported',
  // Wallet has no past trades, so trader can link a referral code.
  ELIGIBLE = 'eligible',
  // Wallet has past trades and already has a linked referral code.
  LINKED = 'linked',
  // Wallet has past trades and no linked referral code, so it cannot be linked.
  INELIGIBLE = 'ineligible',
  // Eligibility could not be determined due to timeout or backend error.
  ELIGIBILITY_UNKNOWN = 'eligibility-unknown',
}

interface UseAffiliateTraderWalletResult {
  walletStatus: TraderWalletStatus
  eligibilityStatus: TraderEligibilityStatus
}

export function useAffiliateTraderWallet(): UseAffiliateTraderWalletResult {
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const { isLinked } = useAtomValue(affiliateTraderAtom)

  const supportedTradingNetwork = isSupportedTradingNetwork(chainId)
  const { status: eligibilityStatus, hasLoadingTimeout } = useAffiliateTraderEligibility({
    account,
    enabled: !!account && supportedTradingNetwork && !isLinked,
  })

  const walletStatus = useMemo(() => {
    if (!account) {
      return TraderWalletStatus.DISCONNECTED
    }
    if (!supportedTradingNetwork) {
      return TraderWalletStatus.UNSUPPORTED
    }
    if (isLinked) {
      return TraderWalletStatus.LINKED
    }
    if (hasLoadingTimeout || eligibilityStatus === TraderEligibilityStatus.ERROR) {
      return TraderWalletStatus.ELIGIBILITY_UNKNOWN
    }
    if (eligibilityStatus === TraderEligibilityStatus.HAS_PAST_TRADES) {
      return TraderWalletStatus.INELIGIBLE
    }
    if (eligibilityStatus === TraderEligibilityStatus.NO_PAST_TRADES) {
      return TraderWalletStatus.ELIGIBLE
    }
    return TraderWalletStatus.PENDING
  }, [account, eligibilityStatus, hasLoadingTimeout, isLinked, supportedTradingNetwork])

  return {
    walletStatus,
    eligibilityStatus,
  }
}
