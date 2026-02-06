import { ReactNode } from 'react'

import { Order } from 'legacy/state/orders/actions'

import * as styledEl from './AffectedPermitOrdersTable.styled'

import { usePendingOrdersPrices } from '../../../orders'
import { HistoryStatusFilter } from '../../hooks/useFilteredOrders'
import { TabOrderTypes } from '../../index'
import { OrdersTableStateUpdater } from '../../state/OrdersTable.updater'
import { AffectedPermitOrderWithActions } from '../AffectedPermitOrderWithActions/AffectedPermitOrderWithActions.container'
import { OrdersReceiptModal } from '../OrdersReceiptModal/OrdersReceiptModal.container'

interface AffectedPermitOrdersTableProps {
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
