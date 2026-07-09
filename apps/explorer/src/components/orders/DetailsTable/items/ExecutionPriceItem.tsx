import { ReactNode } from 'react'

import { BigNumber } from 'bignumber.js'

import { DetailRow } from '../../../common/DetailRow'
import { OrderPriceDisplay, OrderPriceDisplayProps } from '../../OrderPriceDisplay'
import { DetailsTableTooltips } from '../detailsTableTooltips'

interface ExecutionPriceItemProps extends OrderPriceDisplayProps {
  filledAmount: BigNumber
}

export function ExecutionPriceItem({ filledAmount, ...orderPriceDisplayProps }: ExecutionPriceItemProps): ReactNode {
  return (
    <DetailRow label="Execution price" tooltipText={DetailsTableTooltips.priceExecution}>
      {!filledAmount.isZero() ? <OrderPriceDisplay {...orderPriceDisplayProps} /> : '-'}
    </DetailRow>
  )
}
