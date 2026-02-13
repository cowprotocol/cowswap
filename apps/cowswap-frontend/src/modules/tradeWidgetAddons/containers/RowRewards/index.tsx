import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { Trans } from '@lingui/react/macro'

import { AFFILIATE_HIDE_REWARDS_ROW_IF_INELIGIBLE } from 'modules/affiliate/config/affiliateProgram.const'
import { TraderWalletStatus, useAffiliateTraderWallet } from 'modules/affiliate/hooks/useAffiliateTraderWallet'
import { useIsRewardsRowVisible } from 'modules/affiliate/hooks/useIsRowRewardsVisible'
import { AffiliateTraderWithSavedCode, affiliateTraderAtom } from 'modules/affiliate/state/affiliateTraderAtom'
import { openTraderReferralCodeModalAtom } from 'modules/affiliate/state/affiliateTraderWriteAtoms'

import { RowRewardsContent } from '../../pure/Row/RowRewards'

export function RowRewards(): ReactNode {
  const isRewardsRowVisible = useIsRewardsRowVisible()
  const affiliateTrader = useAtomValue(affiliateTraderAtom)
  const openModal = useSetAtom(openTraderReferralCodeModalAtom)
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const { walletStatus, linkedCode } = useAffiliateTraderWallet({
    account,
    chainId,
    savedCode: affiliateTrader.savedCode,
  })
  const shouldHideForIneligible =
    AFFILIATE_HIDE_REWARDS_ROW_IF_INELIGIBLE && walletStatus === TraderWalletStatus.INELIGIBLE
  const eligibilityCheckIsLoading = walletStatus === TraderWalletStatus.UNKNOWN

  const currentLinkedCode = getLinkedCode(affiliateTrader, walletStatus, linkedCode)
  const hasLinkedCode = Boolean(currentLinkedCode)
  const hasSavedValidCode = shouldShowSavedCode(affiliateTrader, hasLinkedCode)
  const displayCode = currentLinkedCode ?? (hasSavedValidCode ? affiliateTrader.savedCode : undefined)
  const tooltipContent = getTooltipContent(hasLinkedCode, hasSavedValidCode)
  const handleOpenModal = (): void => {
    openModal()
  }

  if (!isRewardsRowVisible || shouldHideForIneligible || eligibilityCheckIsLoading) {
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

function getLinkedCode(
  traderReferralCode: AffiliateTraderWithSavedCode,
  walletStatus: ReturnType<typeof useAffiliateTraderWallet>['walletStatus'],
  linkedCode?: string,
): string | undefined {
  if (walletStatus === TraderWalletStatus.LINKED) {
    return linkedCode
  }

  if (traderReferralCode.verification.kind === 'linked') {
    return traderReferralCode.verification.linkedCode
  }

  return undefined
}

function shouldShowSavedCode(traderReferralCode: AffiliateTraderWithSavedCode, hasLinkedCode: boolean): boolean {
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
