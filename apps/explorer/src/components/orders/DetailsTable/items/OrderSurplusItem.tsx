import { ReactNode } from 'react'

import { OrderSurplusDisplay } from 'components/orders/OrderSurplusDisplay'

import { Order } from '../../../../api/operator'
import { DetailRow } from '../../../common/DetailRow'
import { DetailsTableTooltips } from '../detailsTableTooltips'

interface OrderSurplusItemProps {
  order: Order
}

export function OrderSurplusItem({ order }: OrderSurplusItemProps): ReactNode {
  const { surplusAmount } = order

  return (
    <DetailRow label="Order surplus" tooltipText={DetailsTableTooltips.surplus}>
      {!surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}
    </DetailRow>
  )
}
