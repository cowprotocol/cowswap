import { LONG_PRECISION } from '@cowprotocol/common-const'
import { formatFiatAmount, FractionUtils } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { Fraction } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

export interface FiatAmountProps {
  amount: Nullish<Fraction>
  accurate?: boolean
  defaultValue?: string
  className?: string
}

const Wrapper = styled.span`
  color: inherit;
  word-break: break-all;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
