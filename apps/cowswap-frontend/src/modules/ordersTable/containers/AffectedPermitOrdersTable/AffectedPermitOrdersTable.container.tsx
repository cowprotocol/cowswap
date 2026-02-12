import { ReactNode } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { usePendingOrdersPrices } from 'modules/orders/hooks/usePendingOrdersPrices'

import * as styledEl from './AffectedPermitOrdersTable.styled'

import { useResetOrdersTableFilters } from '../../hooks/useResetOrdersTableFilters'
import { TabOrderTypes } from '../../state/ordersTable.types'
import { HistoryStatusFilter } from '../../utils/getFilteredOrders'
import { AffectedPermitOrderWithActions } from '../AffectedPermitOrderWithActions/AffectedPermitOrderWithActions.container'
import { OrdersReceiptModal } from '../OrdersReceiptModal/OrdersReceiptModal.container'

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

      {/* <OrdersTableStateUpdater orders={orders} /> */}

      {orders.map((order) => (
        <styledEl.OrderWrapper key={order.id}>
          <AffectedPermitOrderWithActions order={order} />
        </styledEl.OrderWrapper>
      ))}
    </>
  )
}
