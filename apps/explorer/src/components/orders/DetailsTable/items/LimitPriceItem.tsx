import { ReactNode } from 'react'

import { DetailRow } from '../../../common/DetailRow'
import { OrderPriceDisplay, OrderPriceDisplayProps } from '../../OrderPriceDisplay'
import { DetailsTableTooltips } from '../detailsTableTooltips'

type LimitPriceItemProps = OrderPriceDisplayProps

export function LimitPriceItem(props: LimitPriceItemProps): ReactNode {
  return (
    <DetailRow label="Limit Price" tooltipText={DetailsTableTooltips.priceLimit}>
      <OrderPriceDisplay {...props} />
    </DetailRow>
  )
}
