import { ReactNode } from 'react'

import { Order } from 'legacy/state/orders/actions'

import * as styledEl from './styled'

import { AffectedPermitOrder } from '../../containers/AffectedPermitOrder'

export type AffectedOrdersWithPermitProps = {
  orders: Order[]
}

export function AffectedOrdersWithPermit({ orders }: AffectedOrdersWithPermitProps): ReactNode {
  return orders.map((order) => {
    return (
      <styledEl.OrderWrapper key={order.id}>
        <AffectedPermitOrder order={order} />
      </styledEl.OrderWrapper>
    )
  })
}
