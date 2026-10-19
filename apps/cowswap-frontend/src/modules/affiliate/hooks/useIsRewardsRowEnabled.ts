import { isInjectedWidget } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'

import { useAffiliateChainId } from './useAffiliateChainId'
import { TraderWalletStatus, useAffiliateTraderWallet } from './useAffiliateTraderWallet'
import { useIsRefCodeExpired } from './useIsRefCodeExpired'

import { AFFILIATE_HIDE_REWARDS_ROW_IF_INELIGIBLE } from '../config/affiliateProgram.const'

export function useIsRewardsRowEnabled(): boolean {
  const chainId = useAffiliateChainId()
  const walletStatus = useAffiliateTraderWallet()
  const isRefCodeExpired = useIsRefCodeExpired()

  if (chainId !== undefined && isSolanaChain(chainId)) return false

  if (isRefCodeExpired) return false

  if (walletStatus === TraderWalletStatus.UNSUPPORTED) {
    return false
  }

  if (AFFILIATE_HIDE_REWARDS_ROW_IF_INELIGIBLE && walletStatus === TraderWalletStatus.INELIGIBLE) {
    return false
  }

  return !isInjectedWidget()
}
