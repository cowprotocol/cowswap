import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/macro'

import { useReferral, useReferralActions } from 'modules/affiliate'

import { Routes } from 'common/constants/routes'

import { RowRewardsContent } from '../../pure/Row/RowRewards'

export function useIsRowRewardsVisible(): boolean {
  const { isAffiliateRewardsEnabled = true } = useFeatureFlags()
  return isAffiliateRewardsEnabled
}

export function RowRewards(): ReactNode {
  const isRowRewardsVisible = useIsRowRewardsVisible()
  const referral = useReferral()
  const referralActions = useReferralActions()

  const linkedCodeFromWallet = referral.wallet.status === 'linked' ? referral.wallet.code : undefined
  const linkedCodeFromVerification =
    referral.verification.kind === 'linked' ? referral.verification.linkedCode : undefined
  const linkedCode = linkedCodeFromWallet || linkedCodeFromVerification || undefined
  const tooltipContent = linkedCode ? (
    <Trans>Your wallet is linked to this referral code.</Trans>
  ) : (
    <Trans>Earn more by adding a referral code.</Trans>
  )

  if (!isRowRewardsVisible) {
    return null
  }

  return (
    <RowRewardsContent
      linkedCode={linkedCode}
      accountLink={`#${Routes.ACCOUNT}`}
      tooltipContent={tooltipContent}
      onAddCode={() => referralActions.openModal('rewards')}
    />
  )
}
