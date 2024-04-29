import React from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

import styled from 'styled-components/macro'
import { capitalize } from 'utils'

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
