import { LONG_PRECISION } from '@cowprotocol/common-const'
import { formatFiatAmount, FractionUtils } from '@cowprotocol/common-utils'

import styled from 'styled-components/macro'

import { FractionLike, Nullish } from '../../types'

export interface FiatAmountProps {
  amount: Nullish<FractionLike>
  accurate?: boolean
  defaultValue?: string
  className?: string
}

const Wrapper = styled.span`
  color: inherit;
`

export function FiatAmount({ amount, defaultValue, className, accurate = false }: FiatAmountProps) {
  const formattedAmount = formatFiatAmount(amount)
  const title = FractionUtils.fractionLikeToExactString(amount, LONG_PRECISION)
  const accuracySymbol = accurate ? '' : '≈ '

  return (
    <Wrapper title={title} className={(className || '') + ' fiat-amount'}>
      {formattedAmount ? accuracySymbol + '$' : ''}
      {formattedAmount || defaultValue}
    </Wrapper>
  )
}
