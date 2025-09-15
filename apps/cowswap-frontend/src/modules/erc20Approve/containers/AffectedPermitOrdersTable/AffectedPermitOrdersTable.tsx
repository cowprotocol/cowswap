import { ReactNode } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { usePendingOrdersPrices } from 'modules/orders'
import { TabOrderTypes } from 'modules/ordersTable'
import { OrdersReceiptModal } from 'modules/ordersTable/containers/OrdersReceiptModal'
import { OrdersTableStateUpdater } from 'modules/ordersTable/updaters/OrdersTableStateUpdater'

import * as styledEl from './styled'

import { AffectedPermitOrderWithActions } from '../AffectedPermitOrderWithActions'

type AffectedPermitOrdersTableProps = {
  orders: Order[]
}

export function AffectedPermitOrdersTable({ orders }: AffectedPermitOrdersTableProps): ReactNode {
  const pendingOrdersPrices = usePendingOrdersPrices()

  return (
    <>
      <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />
      <OrdersTableStateUpdater searchTerm={''} orders={orders} orderType={TabOrderTypes.LIMIT} />
      {orders.map((order) => (
        <styledEl.OrderWrapper key={order.id}>
          <AffectedPermitOrderWithActions order={order} />
        </styledEl.OrderWrapper>
      ))}
    </>
  )
}
