import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { TraderWalletStatus, useAffiliateTraderWallet } from './useAffiliateTraderWallet'
import { useIsRefCodeExpired } from './useIsRefCodeExpired'

import { AFFILIATE_HIDE_REWARDS_ROW_IF_INELIGIBLE } from '../config/affiliateProgram.const'

export function useIsRewardsRowEnabled(): boolean {
  const { isAffiliateProgramEnabled } = useFeatureFlags()
  const walletStatus = useAffiliateTraderWallet()
  const isRefCodeExpired = useIsRefCodeExpired()

  if (isRefCodeExpired) return false

  if (AFFILIATE_HIDE_REWARDS_ROW_IF_INELIGIBLE && walletStatus === TraderWalletStatus.INELIGIBLE) {
    return false
  }

  return isAffiliateProgramEnabled && !isInjectedWidget()
}
