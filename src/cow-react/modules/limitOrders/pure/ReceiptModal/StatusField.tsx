import * as styledEl from './styled'
import { orderStatusTitleMap } from '../Orders/OrderRow'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { OrderStatusBox } from '@cow/modules/limitOrders/pure/OrderStatusBox'

export type Props = {
  order: ParsedOrder
}

export function StatusField({ order }: Props) {
  return (
    <styledEl.Value>
      <OrderStatusBox style={{ width: 'auto' }} cancelling={!!order.isCancelling} status={order.status}>
        {order.isCancelling ? 'Cancelling...' : orderStatusTitleMap[order.status]}
      </OrderStatusBox>
    </styledEl.Value>
  )
}
