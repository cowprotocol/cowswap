import React from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Color } from '@cowprotocol/ui'

import styled from 'styled-components'
import { capitalize } from 'utils'

const TradeTypeWrapper = styled.div`
  span {
    &.long {
      color: ${Color.explorer_green1};
    }
    &.short {
      color: ${Color.explorer_red1};
    }
  }
`
export type TradeTypeProps = {
  kind: OrderKind
}

const TradeOrderType = ({ kind }: TradeTypeProps): React.ReactNode | null => {
  return (
    <TradeTypeWrapper>
      <span className={isSellOrder(kind) ? 'short' : 'long'}>{capitalize(kind)}</span>
    </TradeTypeWrapper>
  )
}

export default TradeOrderType
