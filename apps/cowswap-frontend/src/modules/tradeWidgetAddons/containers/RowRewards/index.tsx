import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/macro'

import { RowRewardsContent } from '../../pure/Row/RowRewards'

export function useIsRowRewardsVisible(): boolean {
  const { isAffiliateRewardsEnabled } = useFeatureFlags()

  // TODO: Replace with actual referral code detection once available.
  const hasReferralCode = false

  return isAffiliateRewardsEnabled && !hasReferralCode
}

export function RowRewards(): ReactNode {
  const isRowRewardsVisible = useIsRowRewardsVisible()
  const tooltipContent = <Trans>Earn more by adding a referral code.</Trans>

  if (!isRowRewardsVisible) {
    return null
  }

  return <RowRewardsContent tooltipContent={tooltipContent} />
}
