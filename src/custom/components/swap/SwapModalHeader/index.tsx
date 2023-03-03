// import { computeTradePriceBreakdown } from '../TradeSummary'
import SwapModalHeaderMod, { SwapModalHeaderProps } from './SwapModalHeaderMod'
import styled from 'styled-components/macro'
import { LightCard as LightCardUni } from 'components/Card'
import { HighFeeWarning as HighFeeWarningBase } from 'components/SwapWarnings'
import { useWalletInfo } from '@cow/modules/wallet'
import { NoImpactWarning } from '@cow/modules/trade/pure/NoImpactWarning'
import { SwapShowAcceptChanges } from 'components/swap/styleds'
import { transparentize } from 'polished'
import React from 'react'

const LightCard = styled(LightCardUni)<{ flatBorder?: boolean }>`
  background-color: ${({ theme }) => theme.grey1};
  border: none;
  ${({ flatBorder = false }) => flatBorder && `border-radius: 20px 20px 0 0;`};
`

export type LightCardType = typeof LightCard

// targettable by styled injection
const HighFeeWarning = styled(HighFeeWarningBase)``

const Wrapper = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 auto;
  `};

  ${SwapShowAcceptChanges} {
    background: ${({ theme }) => transparentize(0.85, theme.alert)};
    border: 1px solid ${({ theme }) => transparentize(0.75, theme.alert)};
    padding: 8px 8px 8px 16px;
    margin: 8px 0 0;

    svg {
      stroke: ${({ theme }) => theme.alert};
    }
  }

  svg {
    stroke: ${({ theme }) => theme.text1};
  }
`

export default function SwapModalHeader(
  props: Omit<SwapModalHeaderProps, 'HighFeeWarning' | 'NoImpactWarning' | 'LightCard'>
) {
  const { allowsOffchainSigning } = useWalletInfo()
  const NoImpactWarningComponent = <NoImpactWarning isAccepted={true} withoutAccepting={true} />

  return (
    <Wrapper>
      <SwapModalHeaderMod
        {...props}
        allowsOffchainSigning={allowsOffchainSigning}
        LightCard={LightCard}
        HighFeeWarning={HighFeeWarning}
        NoImpactWarning={NoImpactWarningComponent}
      />
    </Wrapper>
  )
}
