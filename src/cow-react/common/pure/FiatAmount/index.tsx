import { formatFiatAmount } from '@cow/utils/amountFormat'
import { FractionLike, Nullish } from '@cow/types'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { LONG_PRECISION } from 'constants/index'
import { FeatureFlag } from '@cow/utils/featureFlags'
import styled from 'styled-components/macro'
import { AMOUNTS_FORMATTING_FEATURE_FLAG } from '@cow/constants/featureFlags'

export interface FiatAmountProps {
  amount: Nullish<FractionLike>
  accurate?: boolean
  defaultValue?: string
  className?: string
}

const highlight = !!FeatureFlag.get(AMOUNTS_FORMATTING_FEATURE_FLAG)

const Wrapper = styled.span<{ highlight: boolean }>`
  background: ${({ highlight }) => (highlight ? 'rgba(113,255,18,0.4)' : '')};
`

export function FiatAmount({ amount, defaultValue, className, accurate = false }: FiatAmountProps) {
  const formattedAmount = formatFiatAmount(amount)
  const title = FractionUtils.fractionLikeToExactString(amount, LONG_PRECISION)
  const accuracySymbol = accurate ? '' : '≈ '

  return (
    <Wrapper title={title} className={className} highlight={highlight}>
      {formattedAmount ? accuracySymbol + '$' : ''}
      {formattedAmount || defaultValue}
    </Wrapper>
  )
}
