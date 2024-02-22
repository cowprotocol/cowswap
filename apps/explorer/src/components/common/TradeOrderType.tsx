import React from 'react'
import styled from 'styled-components'
import { capitalize } from 'utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { isSellOrder } from '@cowprotocol/common-utils'

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
  return (
    <TradeTypeWrapper>
      <span className={isSellOrder(kind) ? 'short' : 'long'}>{capitalize(kind)}</span>
    </TradeTypeWrapper>
  )
}

export default TradeOrderType
