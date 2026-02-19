import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { Trans } from '@lingui/react/macro'

import { AFFILIATE_HIDE_REWARDS_ROW_IF_INELIGIBLE } from 'modules/affiliate/config/affiliateProgram.const'
import { TraderWalletStatus, useAffiliateTraderWallet } from 'modules/affiliate/hooks/useAffiliateTraderWallet'
import { useIsRewardsRowVisible } from 'modules/affiliate/hooks/useIsRewardsRowVisible'
import { useToggleAffiliateModal } from 'modules/affiliate/hooks/useToggleAffiliateModal'
import { AffiliateTraderWithSavedCode, affiliateTraderAtom } from 'modules/affiliate/state/affiliateTraderAtom'

import { RowRewardsContent } from '../../tradeWidgetAddons/pure/Row/RowRewards'

export function AffiliateTraderRewardsRow(): ReactNode {
  const isRewardsRowVisible = useIsRewardsRowVisible()
  const affiliateTrader = useAtomValue(affiliateTraderAtom)
  const toggleAffiliateModal = useToggleAffiliateModal()
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

  if (!isRewardsRowVisible || shouldHideForIneligible || eligibilityCheckIsLoading) {
    return null
  }

  const currentLinkedCode = getLinkedCode(affiliateTrader, walletStatus, linkedCode)
  const hasLinkedCode = Boolean(currentLinkedCode)
  const hasSavedValidCode = shouldShowSavedCode(affiliateTrader, hasLinkedCode)
  const displayCode = currentLinkedCode ?? (hasSavedValidCode ? affiliateTrader.savedCode : undefined)
  const tooltipContent = getTooltipContent(hasLinkedCode, hasSavedValidCode)

  return (
    <RowRewardsContent
      linkedCode={displayCode}
      tooltipContent={tooltipContent}
      onAddCode={!displayCode ? toggleAffiliateModal : undefined}
      onManageCode={displayCode ? toggleAffiliateModal : undefined}
    />
  )
}

function getLinkedCode(
  traderReferralCode: AffiliateTraderWithSavedCode,
  walletStatus: ReturnType<typeof useAffiliateTraderWallet>['walletStatus'],
  linkedCode?: string,
): string | undefined {
  if (walletStatus === TraderWalletStatus.LINKED) {
    return linkedCode ?? traderReferralCode.savedCode
  }

  return undefined
}

function shouldShowSavedCode(traderReferralCode: AffiliateTraderWithSavedCode, hasLinkedCode: boolean): boolean {
  if (hasLinkedCode) {
    return false
  }

  return traderReferralCode.verificationStatus === 'valid' && Boolean(traderReferralCode.savedCode)
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
