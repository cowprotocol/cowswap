import React from 'react'
import styled from 'styled-components'
import TradeSummaryMod from './TradeSummaryMod'
import { RowFixed } from 'components/Row'
import { TradeWithFee } from 'state/swap/extension'

const Wrapper = styled.div`
  ${RowFixed} {
    > div {
      color: ${({ theme }) => theme.text1};
    }
  }
`

export default function TradeSummary({ trade, allowedSlippage }: { trade: TradeWithFee; allowedSlippage: number }) {
  return (
    <Wrapper>
      <TradeSummaryMod trade={trade} allowedSlippage={allowedSlippage} />
    </Wrapper>
  )
}
