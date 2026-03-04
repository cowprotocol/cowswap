import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/common-entities'
import { UI, FiatAmount } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { PriceImpactIndicator } from '../PriceImpactIndicator'

const FiatValueWrapper = styled.div<{ hasValue$: boolean }>`
  display: inline-block;
  font-size: 14px;
  color: ${({ hasValue$ }) => (hasValue$ ? 'inherit' : `var(${UI.COLOR_DANGER_TEXT})`)};
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
`

interface FiatValueProps {
  fiatValue?: Nullish<CurrencyAmount<Currency>>
  priceImpactParams?: PriceImpact
  className?: string
  isBridging?: boolean
}

export function FiatValue({ fiatValue, priceImpactParams, className, isBridging }: FiatValueProps): ReactNode {
  return (
    <FiatValueWrapper className={className} hasValue$={!!fiatValue}>
      {fiatValue ? <FiatAmount amount={fiatValue} /> : ''}
      <PriceImpactIndicator priceImpactParams={priceImpactParams} isBridging={isBridging} />
    </FiatValueWrapper>
  )
}
