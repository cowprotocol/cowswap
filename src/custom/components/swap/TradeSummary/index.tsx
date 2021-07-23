import React from 'react'
import styled from 'styled-components'
import TradeSummaryMod from './TradeSummaryMod'
import { RowFixed } from 'components/Row'
import { WithClassName } from 'types'
import { AdvancedSwapDetailsProps } from '../AdvancedSwapDetails'

const Wrapper = styled.div`
  ${RowFixed} {
    > div {
      color: ${({ theme }) => theme.text4};
    }
  }
`

export type TradeSummaryProps = Required<AdvancedSwapDetailsProps> & WithClassName

export default function TradeSummary({ className, trade, allowedSlippage, showHelpers, showFee }: TradeSummaryProps) {
  return (
    <Wrapper className={className}>
      <TradeSummaryMod trade={trade} allowedSlippage={allowedSlippage} showHelpers={showHelpers} showFee={showFee} />
    </Wrapper>
  )
}
