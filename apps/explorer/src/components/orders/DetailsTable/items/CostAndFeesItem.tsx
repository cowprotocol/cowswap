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
    // The breakdown renders as a total plus an expandable table, so it needs the stacked layout.
    <DetailRow label="Costs and fees" tooltipText={DetailsTableTooltips.fees} stack>
      <GasFeeDisplay order={order} />
    </DetailRow>
  )
}
