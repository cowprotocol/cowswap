import { useFeatureFlags } from '@cowprotocol/common-hooks'

export function useIsRowRewardsVisible(): boolean {
  const { isAffiliateRewardsEnabled } = useFeatureFlags()

  // TODO: Replace with actual referral code detection once available.
  const hasReferralCode = false

  return isAffiliateRewardsEnabled && !hasReferralCode
}
