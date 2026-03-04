import { ReactNode } from 'react'

import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled, { keyframes } from 'styled-components/macro'

import { IneligibleCard, IneligibleSubtitle, IneligibleTitle } from '../shared'

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  20% {
    transform: scale(1.05);
  }
  30% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.05);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(1);
  }
`

const jump = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
`

const LoadingLogo = styled.span`
  min-height: 100px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 1s infinite ease-in-out;
`

const LoadingSubtitle = styled(IneligibleSubtitle)`
  margin-top: -8px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`

const LoadingDots = styled.span`
  display: inline-block;

  > span {
    display: inline-block;
    animation: ${jump} 1.4s infinite;
    line-height: 1;
  }

  > span:nth-child(2) {
    animation-delay: 0.2s;
  }

  > span:nth-child(3) {
    animation-delay: 0.4s;
  }
`

export function AffiliateTraderLoading(): ReactNode {
  return (
    <IneligibleCard>
      <LoadingLogo aria-hidden="true">
        <ProductLogo
          variant={ProductVariant.CowSwap}
          logoIconOnly
          height={100}
          overrideColor={`var(${UI.COLOR_PRIMARY})`}
        />
      </LoadingLogo>

      <IneligibleTitle>
        <Trans>Checking your wallet</Trans>
      </IneligibleTitle>

      <LoadingSubtitle>
        <Trans>Loading your rewards status</Trans>
        <LoadingDots aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </LoadingDots>
      </LoadingSubtitle>
    </IneligibleCard>
  )
}
