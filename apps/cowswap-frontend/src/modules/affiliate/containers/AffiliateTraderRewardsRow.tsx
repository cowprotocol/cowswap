import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { StyledInfoIcon, StyledRowBetween, TextWrapper } from '../../tradeWidgetAddons/pure/Row/styled'
import { AffiliateEntrySource } from '../analytics/affiliateAnalytics.types'
import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { openTraderModalAtom } from '../state/affiliateTraderModalAtom'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

export function AffiliateTraderRewardsRow(): ReactNode {
  const analytics = useCowAnalytics()
  const openAffiliateModal = useSetAtom(openTraderModalAtom)
  const { savedCode, isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)

  const onOpenModal = useCallback((): void => {
    trackAffiliateEvent({
      analytics,
      action: 'affiliate_trader_rewards_row_clicked',
      hasSavedCode: !!savedCode,
      isLinked: !!isLinked,
    })
    openAffiliateModal(AffiliateEntrySource.TRADER_REWARDS_ROW)
  }, [analytics, isLinked, openAffiliateModal, savedCode])

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
          onClick={onOpenModal}
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
