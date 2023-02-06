import { formatFiatAmount } from '@cow/utils/amountFormat'
import { FractionLike, Nullish } from '@cow/types'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { LONG_PRECISION } from 'constants/index'

export interface FiatAmountProps {
  amount: Nullish<FractionLike>
  accurate?: boolean
  defaultValue?: string
  className?: string
}

// TODO: remove after testing
const highlight = !!localStorage.getItem('amountsRefactoring')

export function FiatAmount({ amount, defaultValue, className, accurate = false }: FiatAmountProps) {
  const formattedAmount = formatFiatAmount(amount)
  const title = FractionUtils.fractionLikeToExactString(amount, LONG_PRECISION)
  const accuracySymbol = accurate ? '' : '≈ '

  return (
    <span title={title} className={className} style={{ background: highlight ? 'rgba(113,255,18,0.4)' : '' }}>
      {formattedAmount ? accuracySymbol + '$' : ''}
      {formattedAmount || defaultValue}
    </span>
  )
}
