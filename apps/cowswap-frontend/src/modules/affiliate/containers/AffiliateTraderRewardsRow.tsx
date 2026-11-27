import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import { HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { StyledInfoIcon, StyledRowBetween, TextWrapper } from '../../tradeWidgetAddons/pure/Row/styled'
import { toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

const LabelText = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: inherit;
`

export function AffiliateTraderRewardsRow(): ReactNode {
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)

  const { savedCode, isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)

  return (
    <StyledRowBetween>
      <RowFixed>
        <LabelText>
          <Trans>Referral code</Trans>
        </LabelText>
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
