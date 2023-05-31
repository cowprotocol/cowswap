import { ParsedOrder } from 'modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { OrderStatusBox } from 'modules/limitOrders/pure/OrderStatusBox'

import * as styledEl from './styled'

export type Props = {
  order: ParsedOrder
}

export function StatusField({ order }: Props) {
  return (
    <styledEl.Value>
      <OrderStatusBox order={order} widthAuto />
    </styledEl.Value>
  )
}
