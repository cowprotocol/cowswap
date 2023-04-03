import { DetailsRow } from '@cow/modules/limitOrders/pure/LimitOrdersDetails/styled'
import { InfoIcon } from 'components/InfoIcon'

export type OrderTypeProps = {
  isPartiallyFillable: boolean
  className?: string
}

export function OrderType({ isPartiallyFillable, className }: OrderTypeProps) {
  const textContent = isPartiallyFillable
    ? 'This order can be partially filled'
    : 'This order will either be filled completely or not filled.'
  const labelText = isPartiallyFillable ? 'Partially fillable' : 'Fill or kill'

  return (
    <DetailsRow className={className}>
      <div>
        <span>
          <p>Order type</p>
        </span>{' '}
        <InfoIcon content={textContent} />
      </div>
      <div>
        <span>{labelText}</span>
      </div>
    </DetailsRow>
  )
}
