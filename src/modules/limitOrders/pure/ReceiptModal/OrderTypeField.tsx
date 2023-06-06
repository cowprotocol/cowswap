import { ParsedOrder } from 'modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'

import * as styledEl from './styled'

export type Props = {
  order: ParsedOrder
}

export function OrderTypeField({ order }: Props) {
  return (
    <styledEl.Value>
      <styledEl.OrderTypeValue>
        {order.class} {order.kind} order {order.partiallyFillable ? '(Partially fillable)' : '(Fill or Kill)'}
      </styledEl.OrderTypeValue>
    </styledEl.Value>
  )
}
