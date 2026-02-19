import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { StyledInfoIcon, StyledRowBetween, TextWrapper } from '../../tradeWidgetAddons/pure/Row/styled'
import { AFFILIATE_HIDE_REWARDS_ROW_IF_INELIGIBLE } from '../config/affiliateProgram.const'
import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { useToggleAffiliateModal } from '../hooks/useToggleAffiliateModal'
import { affiliateTraderAtom } from '../state/affiliateTraderAtom'

export function AffiliateTraderRewardsRow(): ReactNode {
  const toggleAffiliateModal = useToggleAffiliateModal()

  const { savedCode, isLinked } = useAtomValue(affiliateTraderAtom)
  const { walletStatus } = useAffiliateTraderWallet()

  if (AFFILIATE_HIDE_REWARDS_ROW_IF_INELIGIBLE && walletStatus === TraderWalletStatus.INELIGIBLE) {
    return null
  }

  return (
    <StyledRowBetween>
      <RowFixed>
        <TextWrapper>
          <Trans>Rewards code</Trans>
        </TextWrapper>
        <HoverTooltip
          wrapInContainer
          content={
            isLinked ? (
              <Trans>Your wallet is linked to this referral code.</Trans>
            ) : savedCode ? (
              <Trans>Your referral code is saved. It will link after your first eligible trade.</Trans>
            ) : (
              <Trans>Earn more by adding a referral code.</Trans>
            )
          }
        >
          <StyledInfoIcon size={16} />
        </HoverTooltip>
      </RowFixed>
      <TextWrapper textAlign="right">
        <LinkStyledButton
          onClick={toggleAffiliateModal}
          as={savedCode ? 'button' : undefined}
          type={savedCode ? 'button' : undefined}
          padding="0"
          margin="0"
          fontSize="inherit"
          color={`var(${UI.COLOR_PRIMARY_LIGHTER})`}
        >
          {savedCode || <Trans>Add code</Trans>}
        </LinkStyledButton>
      </TextWrapper>
    </StyledRowBetween>
  )
}
