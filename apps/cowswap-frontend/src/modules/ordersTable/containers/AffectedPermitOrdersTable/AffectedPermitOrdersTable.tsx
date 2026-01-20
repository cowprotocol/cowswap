import { ReactNode } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { HistoryStatusFilter } from 'modules/ordersTable/hooks/useFilteredOrders'

import * as styledEl from './styled'

import { usePendingOrdersPrices } from '../../../orders'
import { TabOrderTypes } from '../../index'
import { OrdersTableStateUpdater } from '../../updaters/OrdersTableStateUpdater'
import { AffectedPermitOrderWithActions } from '../AffectedPermitOrderWithActions'
import { OrdersReceiptModal } from '../OrdersReceiptModal'

type AffectedPermitOrdersTableProps = {
  orders: Order[]
}

export function AffectedPermitOrdersTable({ orders }: AffectedPermitOrdersTableProps): ReactNode {
  const pendingOrdersPrices = usePendingOrdersPrices()

  return (
    <>
      <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />

      <OrdersTableStateUpdater
        searchTerm=""
        historyStatusFilter={HistoryStatusFilter.ALL}
        orders={orders}
        orderType={TabOrderTypes.LIMIT}
        syncWithUrl={false}
      />

      {orders.map((order) => (
        <styledEl.OrderWrapper key={order.id}>
          <AffectedPermitOrderWithActions order={order} />
        </styledEl.OrderWrapper>
      ))}
    </>
  )
}
