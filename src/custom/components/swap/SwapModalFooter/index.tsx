import React from 'react'
import { computeTradePriceBreakdown, FEE_TOOLTIP_MSG } from '../TradeSummary/TradeSummaryMod'
import SwapModalFooterMod, { SwapModalFooterProps } from './SwapModalFooterMod'
import { StyledBalanceMaxMini } from 'components/swap/styleds'
import { RowBetween, RowFixed } from 'components/Row'
import styled from 'styled-components'

const Wrapper = styled.div`
  ${StyledBalanceMaxMini} {
    background: ${({ theme }) => theme.bg1};
    color: ${({ theme }) => theme.text1};
  }

  ${RowBetween} > div,
  ${RowFixed} > div {
    color: ${({ theme }) => theme.text2};
  }
`

export default function SwapModalFooter(props: Omit<SwapModalFooterProps, 'fee' | 'priceImpactWithoutFee'>) {
  const { /*priceImpactWithoutFee,*/ realizedFee } = React.useMemo(() => computeTradePriceBreakdown(props.trade), [
    props.trade
  ])

  return (
    <Wrapper>
      <SwapModalFooterMod
        {...props}
        fee={{
          feeTitle: 'Fee',
          feeAmount: realizedFee,
          feeTooltip: FEE_TOOLTIP_MSG
        }}
        // priceImpactWithoutFee={priceImpactWithoutFee}
      />
    </Wrapper>
  )
}
