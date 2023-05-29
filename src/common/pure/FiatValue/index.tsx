import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { FiatAmount } from 'common/pure/FiatAmount'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Nullish } from 'types'
import styled from 'styled-components/macro'
import { PriceImpactIndicator } from '../PriceImpactIndicator'

const FiatValueWrapper = styled.div<{ hasValue$: boolean }>`
  display: inline-block;
  font-size: 14px;
  color: ${({ theme, hasValue$ }) => (hasValue$ ? theme.text1 : theme.text4)};
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
