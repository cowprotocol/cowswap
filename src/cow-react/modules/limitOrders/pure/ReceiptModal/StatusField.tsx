import * as styledEl from './styled'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { OrderStatusBox } from '@cow/modules/limitOrders/pure/OrderStatusBox'

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
