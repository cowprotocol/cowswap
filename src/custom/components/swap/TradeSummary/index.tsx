import React from 'react'
import styled from 'styled-components'
import TradeSummaryMod from './TradeSummaryMod'
import { RowFixed } from 'components/Row'
import TradeGp from 'state/swap/TradeGp'

const Wrapper = styled.div`
  ${RowFixed} {
    > div {
      color: ${({ theme }) => theme.text1};
    }
  }
`

export default function TradeSummary({ trade, allowedSlippage }: { trade: TradeGp; allowedSlippage: number }) {
  return (
    <Wrapper>
      <TradeSummaryMod trade={trade} allowedSlippage={allowedSlippage} />
    </Wrapper>
  )
}
