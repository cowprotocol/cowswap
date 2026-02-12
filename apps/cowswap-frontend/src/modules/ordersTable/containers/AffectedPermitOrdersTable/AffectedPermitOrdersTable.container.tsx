import { ReactNode } from 'react'

import { Order } from 'legacy/state/orders/actions'

import * as styledEl from './AffectedPermitOrdersTable.styled'

import { usePendingOrdersPrices } from '../../../orders'
import { AffectedPermitOrderWithActions } from '../AffectedPermitOrderWithActions/AffectedPermitOrderWithActions.container'
import { OrdersReceiptModal } from '../OrdersReceiptModal/OrdersReceiptModal.container'
import { HistoryStatusFilter } from 'modules/ordersTable/hooks/useFilteredOrders'
import { useResetOrdersTableFilters } from 'modules/ordersTable/hooks/useOrdersTableFilters'
import { TabOrderTypes } from 'modules/ordersTable/state/ordersTable.types'

interface AffectedPermitOrdersTableProps {
  orders: Order[]
}

export function AffectedPermitOrdersTable({ orders }: AffectedPermitOrdersTableProps): ReactNode {
  const pendingOrdersPrices = usePendingOrdersPrices()

  useResetOrdersTableFilters({
    orderType: TabOrderTypes.LIMIT,
    historyStatusFilter: HistoryStatusFilter.FILLED,
  })

  return (
    <>
      <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />

      { /* <OrdersTableStateUpdater orders={orders} /> */ }

      {orders.map((order) => (
        <styledEl.OrderWrapper key={order.id}>
          <AffectedPermitOrderWithActions order={order} />
        </styledEl.OrderWrapper>
      ))}
    </>
  )
}
