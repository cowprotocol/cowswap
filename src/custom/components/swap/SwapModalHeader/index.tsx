import React from 'react'
// import { computeTradePriceBreakdown } from '../TradeSummary'
import SwapModalHeaderMod, { SwapModalHeaderProps } from './SwapModalHeaderMod'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components'
import { LightCard as LightCardUni } from 'components/Card'
import { darken, transparentize } from 'polished'
import { AuxInformationContainer } from 'components/CurrencyInputPanel'
import { HighFeeWarning as HighFeeWarningBase } from 'components/HighFeeWarning'
import { useWalletInfo } from 'hooks/useWalletInfo'

const LightCard = styled(LightCardUni)<{ flatBorder?: boolean }>`
  background-color: ${({ theme }) => darken(0.06, theme.bg1)};
  border: 2px solid ${({ theme }) => transparentize(0.5, theme.bg0)};
  ${({ flatBorder = false }) => flatBorder && `border-radius: 20px 20px 0 0;`}
`

export type LightCardType = typeof LightCard

// targettable by styled injection
const HighFeeWarning = styled(HighFeeWarningBase)``

const Wrapper = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 32px auto 0;
  `};

  svg {
    stroke: ${({ theme }) => theme.text1};
  }

  ${AutoColumn} > div:not(${HighFeeWarning}) > div {
    color: ${({ theme }) => theme.text1};
  }

  ${AuxInformationContainer}:not(${HighFeeWarning}) {
    background-color: ${({ theme }) => theme.bg3};
    border: 2px solid ${({ theme }) => transparentize(0.5, theme.bg0)};
    border-top: 0;

    &:hover {
      border: 2px solid ${({ theme }) => transparentize(0.5, theme.bg0)};
      border-top: 0;
    }
  }
`

export default function SwapModalHeader(props: Omit<SwapModalHeaderProps, 'HighFeeWarning' | 'LightCard'>) {
  const { allowsOffchainSigning } = useWalletInfo()
  return (
    <Wrapper>
      <SwapModalHeaderMod
        {...props}
        allowsOffchainSigning={allowsOffchainSigning}
        LightCard={LightCard}
        HighFeeWarning={HighFeeWarning}
      />
    </Wrapper>
  )
}
