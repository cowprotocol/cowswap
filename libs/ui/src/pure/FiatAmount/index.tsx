import { ReactNode } from 'react'

import { LONG_PRECISION } from '@cowprotocol/common-const'
import { formatFiatAmount, FractionUtils } from '@cowprotocol/common-utils'

import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { FractionLike, Nullish } from '../../types'

export interface FiatAmountProps {
  amount: Nullish<FractionLike>
  accurate?: boolean
  defaultValue?: string
  className?: string
  withParentheses?: boolean
}

const Wrapper = styled.span`
  color: inherit;
  word-break: break-all;
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export function FiatAmount({
  amount,
  defaultValue,
  className,
  accurate = false,
  withParentheses = false,
}: FiatAmountProps): ReactNode {
  const formattedAmount = formatFiatAmount(amount)
  const title = FractionUtils.fractionLikeToExactString(amount, LONG_PRECISION)
  const accuracySymbol = accurate ? '' : '≈ '

  const content = formattedAmount ? `${accuracySymbol}$${formattedAmount}` : defaultValue

  return (
    <Wrapper title={title} className={(className || '') + ' fiat-amount'}>
      {withParentheses && content ? `(${content})` : content}
    </Wrapper>
  )
}
