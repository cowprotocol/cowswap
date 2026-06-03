import { ReactNode } from 'react'

import { GasFeeDisplay } from 'components/orders/GasFeeDisplay'

import { Order } from '../../../../api/operator'
import { DetailRow } from '../../../common/DetailRow'
import { DetailsTableTooltips } from '../detailsTableTooltips'

interface CostAndFeesItemProps {
  order: Order
}

export function CostAndFeesItem({ order }: CostAndFeesItemProps): ReactNode {
  return (
    <DetailRow label="Costs & Fees" tooltipText={DetailsTableTooltips.fees} stack>
      <GasFeeDisplay order={order} />
    </DetailRow>
  )
}
