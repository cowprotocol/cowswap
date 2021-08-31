import React from 'react'
// import { computeTradePriceBreakdown } from '../TradeSummary'
import SwapModalHeaderMod, { SwapModalHeaderProps } from './SwapModalHeaderMod'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components'
import { LightCard as LightCardUni } from 'components/Card'
import { darken, transparentize } from 'polished'
import { AuxInformationContainer } from 'components/CurrencyInputPanel'
import { useWalletInfo } from 'hooks/useWalletInfo'

// MOD
const LightCard = styled(LightCardUni)<{ flatBorder?: boolean }>`
  background-color: ${({ theme }) => darken(0.06, theme.bg1)};
  border: 2px solid ${({ theme }) => transparentize(0.5, theme.bg0)};
  ${({ flatBorder = false }) => flatBorder && `border-radius: 20px 20px 0 0;`}
`

export type LightCardType = typeof LightCard

const Wrapper = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 32px auto 0;
  `};

  svg {
    stroke: ${({ theme }) => theme.text1};
  }

  ${AutoColumn} > div > div {
    color: ${({ theme }) => theme.text1};
  }

  ${AuxInformationContainer} {
    background-color: ${({ theme }) => theme.bg3};
    border: 2px solid ${({ theme }) => transparentize(0.5, theme.bg0)};
    border-top: 0;

    &:hover {
      border: 2px solid ${({ theme }) => transparentize(0.5, theme.bg0)};
      border-top: 0;
    }
  }
`

export default function SwapModalHeader(props: Omit<SwapModalHeaderProps, 'LightCard'>) {
  const { allowsOffchainSigning } = useWalletInfo()

  // const { priceImpactWithoutFee } = React.useMemo(() => computeTradePriceBreakdown(props.trade), [props.trade])
  return (
    <Wrapper>
      <SwapModalHeaderMod
        {...props}
        allowsOffchainSigning={allowsOffchainSigning}
        LightCard={LightCard} /*priceImpactWithoutFee={priceImpactWithoutFee}*/
      />
    </Wrapper>
  )
}
