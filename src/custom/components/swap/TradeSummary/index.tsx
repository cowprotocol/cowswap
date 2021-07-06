import React from 'react'
import styled from 'styled-components'
import TradeSummaryMod from './TradeSummaryMod'
import { RowFixed } from 'components/Row'
import TradeGp from 'state/swap/TradeGp'
import { Percent } from '@uniswap/sdk-core'

const Wrapper = styled.div`
  ${RowFixed} {
    > div {
      color: ${({ theme }) => theme.text4};
    }
  }
`

export default function TradeSummary({
  className,
  trade,
  allowedSlippage,
  showHelpers,
}: {
  trade: TradeGp
  allowedSlippage: Percent
  className?: string
  showHelpers?: boolean
}) {
  return (
    <Wrapper className={className}>
      <TradeSummaryMod trade={trade} allowedSlippage={allowedSlippage} showHelpers={showHelpers} />
    </Wrapper>
  )
}
