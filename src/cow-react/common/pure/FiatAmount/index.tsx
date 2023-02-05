import { formatFiatAmount } from '@cow/utils/amountFormat'
import { FractionLike, Nullish } from '@cow/types'

export interface FiatAmountProps {
  amount: Nullish<FractionLike>
  defaultValue?: string
  className?: string
}

// TODO: remove after testing
const highlight = !!localStorage.getItem('amountsRefactoring')

export function FiatAmount({ amount, defaultValue, className }: FiatAmountProps) {
  const formattedAmount = formatFiatAmount(amount)

  return (
    <span className={className} style={{ background: highlight ? 'rgba(113,255,18,0.4)' : '' }}>
      {formattedAmount ? '≈ $' : ''}
      {formattedAmount || defaultValue}
    </span>
  )
}
