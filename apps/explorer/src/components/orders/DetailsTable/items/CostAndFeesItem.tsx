import { ReactNode } from 'react'

import { GasFeeDisplay } from 'components/orders/GasFeeDisplay'
import { useFeeDisplayFeatureFlag } from 'hooks/useFeeDisplayFeatureFlag'

import { Order } from '../../../../api/operator'
import { DetailRow } from '../../../common/DetailRow'
import { DetailsTableTooltips } from '../detailsTableTooltips'

interface CostAndFeesItemProps {
  order: Order
}

export function CostAndFeesItem({ order }: CostAndFeesItemProps): ReactNode {
  const showBreakdown = useFeeDisplayFeatureFlag()

  return (
    // The breakdown renders as a total plus an expandable table, so it needs the stacked layout;
    // the legacy single-line fee keeps the inline one.
    <DetailRow
      label={showBreakdown ? 'Costs and fees' : 'Costs & Fees'}
      tooltipText={showBreakdown ? DetailsTableTooltips.feesBreakdown : DetailsTableTooltips.fees}
      stack={showBreakdown}
    >
      <GasFeeDisplay order={order} showBreakdown={showBreakdown} />
    </DetailRow>
  )
}
