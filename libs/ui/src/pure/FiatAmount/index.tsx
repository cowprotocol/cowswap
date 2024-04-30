import { LONG_PRECISION } from '@cowprotocol/common-const'
import { FeatureFlag, formatFiatAmount, FractionUtils } from '@cowprotocol/common-utils'

import styled from 'styled-components/macro'

import { AMOUNTS_FORMATTING_FEATURE_FLAG } from '../../consts'
import { FractionLike, Nullish } from '../../types'

export interface FiatAmountProps {
  amount: Nullish<FractionLike>
  accurate?: boolean
  defaultValue?: string
  className?: string
}

const highlight = !!FeatureFlag.get(AMOUNTS_FORMATTING_FEATURE_FLAG)

const Wrapper = styled.span<{ highlight: boolean }>`
  background: ${({ highlight }) => (highlight ? 'rgba(113,255,18,0.4)' : '')};
  color: inherit;
`

export function FiatAmount({ amount, defaultValue, className, accurate = false }: FiatAmountProps) {
  const formattedAmount = formatFiatAmount(amount)
  const title = FractionUtils.fractionLikeToExactString(amount, LONG_PRECISION)
  const accuracySymbol = accurate ? '' : '≈ '

  return (
    <Wrapper title={title} className={(className || '') + ' fiat-amount'} highlight={highlight}>
      {formattedAmount ? accuracySymbol + '$' : ''}
      {formattedAmount || defaultValue}
    </Wrapper>
  )
}
