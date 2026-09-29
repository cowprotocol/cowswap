import { ReactNode } from 'react'

import { MessageDescriptor } from '@lingui/core'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from '../ReceiptModal.styled'

export type Props = {
  order: ParsedOrder
}

const ORDER_TYPE_LABELS: Record<UiOrderType, Record<OrderKind, MessageDescriptor>> = {
  [UiOrderType.SWAP]: {
    [OrderKind.BUY]: msg`Market buy order`,
    [OrderKind.SELL]: msg`Market sell order`,
  },
  [UiOrderType.LIMIT]: {
    [OrderKind.BUY]: msg`Limit buy order`,
    [OrderKind.SELL]: msg`Limit sell order`,
  },
  [UiOrderType.TWAP]: {
    [OrderKind.BUY]: msg`TWAP buy order`,
    [OrderKind.SELL]: msg`TWAP sell order`,
  },
  [UiOrderType.HOOKS]: {
    [OrderKind.BUY]: msg`Hooks buy order`,
    [OrderKind.SELL]: msg`Hooks sell order`,
  },
  [UiOrderType.YIELD]: {
    [OrderKind.BUY]: msg`Yield buy order`,
    [OrderKind.SELL]: msg`Yield sell order`,
  },
}

export function OrderTypeField({ order }: Props): ReactNode {
  const uiOrderType = getUiOrderType(order)
  const { i18n, t } = useLingui()
  const descriptor = ORDER_TYPE_LABELS[uiOrderType]?.[order.kind]
  const orderType = descriptor ? i18n._(descriptor) : `${uiOrderType} ${order.kind} order`

  return (
    <styledEl.Value>
      <styledEl.OrderTypeValue>
        {orderType} {order.partiallyFillable ? t`(Partially fillable)` : t`(Fill or Kill)`}
      </styledEl.OrderTypeValue>
    </styledEl.Value>
  )
}
