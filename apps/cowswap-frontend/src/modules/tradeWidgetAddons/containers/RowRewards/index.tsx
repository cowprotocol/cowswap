import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/react/macro'

import { useReferral } from 'modules/affiliate/model/hooks/useReferral'
import { useReferralActions } from 'modules/affiliate/model/hooks/useReferralActions'

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

  const linkedCode = getLinkedCode(referral)
  const hasLinkedCode = Boolean(linkedCode)
  const hasSavedValidCode = shouldShowSavedCode(referral, hasLinkedCode)
  const displayCode = linkedCode ?? (hasSavedValidCode ? referral.savedCode : undefined)
  const tooltipContent = getTooltipContent(hasLinkedCode, hasSavedValidCode)
  const handleOpenModal = (): void => {
    referralActions.openModal('rewards')
  }

  if (!isRowRewardsVisible) {
    return null
  }

  return (
    <RowRewardsContent
      linkedCode={displayCode}
      accountLink={displayCode ? `#${Routes.ACCOUNT}` : undefined}
      tooltipContent={tooltipContent}
      onAddCode={!displayCode ? handleOpenModal : undefined}
    />
  )
}

function getLinkedCode(referral: ReturnType<typeof useReferral>): string | undefined {
  if (referral.wallet.status === 'linked') {
    return referral.wallet.code
  }

  if (referral.verification.kind === 'linked') {
    return referral.verification.linkedCode
  }

  return undefined
}

function shouldShowSavedCode(referral: ReturnType<typeof useReferral>, hasLinkedCode: boolean): boolean {
  if (hasLinkedCode) {
    return false
  }

  return referral.verification.kind === 'valid' && Boolean(referral.savedCode)
}

function getTooltipContent(hasLinkedCode: boolean, hasSavedValidCode: boolean): ReactNode {
  if (hasLinkedCode) {
    return <Trans>Your wallet is linked to this referral code.</Trans>
  }

  if (hasSavedValidCode) {
    return <Trans>Your referral code is saved. It will link after your first eligible trade.</Trans>
  }

  return <Trans>Earn more by adding a referral code.</Trans>
}
