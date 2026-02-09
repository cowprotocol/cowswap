import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { Trans } from '@lingui/react/macro'

import { useTraderReferralCode } from 'modules/affiliate/hooks/useTraderReferralCode'
import { useTraderReferralCodeActions } from 'modules/affiliate/hooks/useTraderReferralCodeActions'

import { RowRewardsContent } from '../../pure/Row/RowRewards'

export function useIsRowRewardsVisible(): boolean {
  const { isAffiliateProgramEnabled = false } = useFeatureFlags()
  return isAffiliateProgramEnabled
}

export function RowRewards(): ReactNode {
  const isRowRewardsVisible = useIsRowRewardsVisible()
  const traderReferralCode = useTraderReferralCode()
  const traderReferralCodeActions = useTraderReferralCodeActions()

  const linkedCode = getLinkedCode(traderReferralCode)
  const hasLinkedCode = Boolean(linkedCode)
  const hasSavedValidCode = shouldShowSavedCode(traderReferralCode, hasLinkedCode)
  const displayCode = linkedCode ?? (hasSavedValidCode ? traderReferralCode.savedCode : undefined)
  const tooltipContent = getTooltipContent(hasLinkedCode, hasSavedValidCode)
  const handleOpenModal = (): void => {
    traderReferralCodeActions.openModal('rewards')
  }

  if (!isRowRewardsVisible) {
    return null
  }

  return (
    <RowRewardsContent
      linkedCode={displayCode}
      tooltipContent={tooltipContent}
      onAddCode={!displayCode ? handleOpenModal : undefined}
      onManageCode={displayCode ? handleOpenModal : undefined}
    />
  )
}

function getLinkedCode(traderReferralCode: ReturnType<typeof useTraderReferralCode>): string | undefined {
  if (traderReferralCode.wallet.status === 'linked') {
    return traderReferralCode.wallet.code
  }

  if (traderReferralCode.verification.kind === 'linked') {
    return traderReferralCode.verification.linkedCode
  }

  return undefined
}

function shouldShowSavedCode(
  traderReferralCode: ReturnType<typeof useTraderReferralCode>,
  hasLinkedCode: boolean,
): boolean {
  if (hasLinkedCode) {
    return false
  }

  return traderReferralCode.verification.kind === 'valid' && Boolean(traderReferralCode.savedCode)
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
