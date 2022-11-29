import * as styledEl from './styled'
import { StatusItem } from '../Orders/OrderRow'
import { orderStatusTitleMap } from '../Orders/OrderRow'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'

export type Props = {
  order: ParsedOrder
}

export function StatusField({ order }: Props) {
  return (
    <styledEl.Value>
      <StatusItem style={{ width: 'auto' }} cancelling={!!order.isCancelling} status={order.status}>
        {order.isCancelling ? 'Cancelling...' : orderStatusTitleMap[order.status]}
      </StatusItem>
    </styledEl.Value>
  )
}
