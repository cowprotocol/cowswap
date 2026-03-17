import { ReactNode } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { usePendingOrdersPrices } from 'modules/orders/hooks/usePendingOrdersPrices'

import * as styledEl from './AffectedPermitOrdersTable.styled'

import { AffectedPermitOrderWithActions } from '../AffectedPermitOrderWithActions/AffectedPermitOrderWithActions.container'
import { OrdersReceiptModal } from '../OrdersReceiptModal/OrdersReceiptModal.container'

interface AffectedPermitOrdersTableProps {
  ordersWithPermit: Order[]
}

export function AffectedPermitOrdersTable({ ordersWithPermit }: AffectedPermitOrdersTableProps): ReactNode {
  const pendingOrdersPrices = usePendingOrdersPrices()

  return (
    <>
      <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />

      {ordersWithPermit.map((order) => (
        <styledEl.OrderWrapper key={order.id}>
          <AffectedPermitOrderWithActions order={order} />
        </styledEl.OrderWrapper>
      ))}
    </>
  )
}
