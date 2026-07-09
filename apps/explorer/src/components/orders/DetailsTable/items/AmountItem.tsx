import { ReactNode } from 'react'

import { AmountsDisplay } from 'components/orders/AmountsDisplay'

import { Order } from 'api/operator'

import { DetailRow } from '../../../common/DetailRow'
import { DetailsTableTooltips } from '../detailsTableTooltips'

interface AmountItemProps {
  order: Order
}

export function AmountItem({ order }: AmountItemProps): ReactNode {
  return (
    <DetailRow label="Amount" tooltipText={DetailsTableTooltips.amount}>
      <AmountsDisplay order={order} />
    </DetailRow>
  )
}
