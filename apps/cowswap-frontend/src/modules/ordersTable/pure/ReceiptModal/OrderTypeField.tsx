import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

export type Props = {
  order: ParsedOrder
  isTwapOrder: boolean
}

export function OrderTypeField({ order, isTwapOrder }: Props) {
  const orderClass = isTwapOrder ? 'TWAP' : order.class

  return (
    <styledEl.Value>
      <styledEl.OrderTypeValue>
        {orderClass} {order.kind} order {order.partiallyFillable ? '(Partially fillable)' : '(Fill or Kill)'}
      </styledEl.OrderTypeValue>
    </styledEl.Value>
  )
}
