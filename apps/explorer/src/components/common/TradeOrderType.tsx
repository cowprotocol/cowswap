import React from 'react'
import styled from 'styled-components'
import { capitalize } from 'utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

const TradeTypeWrapper = styled.div`
  span {
    &.long {
      color: var(--color-long);
    }
    &.short {
      color: var(--color-short);
    }
  }
`
export type TradeTypeProps = {
  kind: OrderKind
}

const TradeOrderType = ({ kind }: TradeTypeProps): JSX.Element | null => {
  const isBuyOrder = kind === 'buy'

  return (
    <TradeTypeWrapper>
      <span className={isBuyOrder ? 'long' : 'short'}>{capitalize(kind)}</span>
    </TradeTypeWrapper>
  )
}

export default TradeOrderType
