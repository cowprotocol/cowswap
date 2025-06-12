import React from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

import { capitalize } from 'utils'

import { TradeTypeWrapper } from './styled'

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
