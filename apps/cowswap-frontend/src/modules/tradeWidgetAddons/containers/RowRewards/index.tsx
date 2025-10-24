import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/macro'

import { useReferral, useReferralActions } from 'modules/affiliate'

import { RowRewardsContent } from '../../pure/Row/RowRewards'

export function useIsRowRewardsVisible(): boolean {
  const { isAffiliateRewardsEnabled } = useFeatureFlags()
  const referral = useReferral()

  const isWalletLinked = referral.wallet.status === 'linked' || referral.verification.kind === 'linked'

  return isAffiliateRewardsEnabled && !isWalletLinked
}

export function RowRewards(): ReactNode {
  const isRowRewardsVisible = useIsRowRewardsVisible()
  const referralActions = useReferralActions()
  const tooltipContent = <Trans>Earn more by adding a referral code.</Trans>

  if (!isRowRewardsVisible) {
    return null
  }

  return <RowRewardsContent tooltipContent={tooltipContent} onAddCode={() => referralActions.openModal('rewards')} />
}
