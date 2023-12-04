import { FiatAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { PriceImpactIndicator } from '../PriceImpactIndicator'

const FiatValueWrapper = styled.div<{ hasValue$: boolean }>`
  display: inline-block;
  font-size: 14px;
  color: ${({ hasValue$ }) => (hasValue$ ? 'inherit' : 'red')};
`

export function FiatValue({
  fiatValue,
  priceImpactParams,
  className,
}: {
  fiatValue?: Nullish<CurrencyAmount<Currency>>
  priceImpactParams?: PriceImpact
  className?: string
}) {
  return (
    <FiatValueWrapper className={className} hasValue$={!!fiatValue}>
      {fiatValue ? <FiatAmount amount={fiatValue} /> : ''}
      <PriceImpactIndicator priceImpactParams={priceImpactParams} />
    </FiatValueWrapper>
  )
}
