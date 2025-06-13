import { UI, FiatAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { PriceImpactIndicator } from '../PriceImpactIndicator'

const FiatValueWrapper = styled.div<{ hasValue$: boolean }>`
  display: inline-block;
  font-size: 14px;
  color: ${({ hasValue$ }) => (hasValue$ ? 'inherit' : `var(${UI.COLOR_DANGER_TEXT})`)};
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
