import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/macro'

import { RowRewardsContent } from '../../pure/Row/RowRewards'

export function RowRewards(): ReactNode {
  const { isAffiliateRewardsEnabled } = useFeatureFlags()
  const tooltipContent = <Trans>Earn more by adding a referral code.</Trans>

  // TODO: Replace with actual referral code detection once available.
  const hasReferralCode = false

  if (!isAffiliateRewardsEnabled || hasReferralCode) {
    return null
  }

  return <RowRewardsContent tooltipContent={tooltipContent} />
}
