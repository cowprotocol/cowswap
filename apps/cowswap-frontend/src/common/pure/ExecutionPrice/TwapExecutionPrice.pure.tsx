import { ReactNode } from 'react'

import { Currency, Price } from '@cowprotocol/currency'
import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './TwapExecutionPrice.styled'

export interface TwapExecutionPriceProps {
  className?: string
  executionPrice: Price<Currency, Currency>
  isInverted: boolean
}

export function TwapExecutionPrice({ className, executionPrice, isInverted }: TwapExecutionPriceProps): ReactNode {
  const displayedPrice = isInverted ? executionPrice.invert() : executionPrice
  const baseSymbol = displayedPrice.baseCurrency.symbol ?? ''
  const quoteSymbol = displayedPrice.quoteCurrency.symbol ?? ''

  return (
    <styledEl.Root className={className}>
      <styledEl.Amount>
        <TokenAmount amount={displayedPrice} hideTokenSymbol />
      </styledEl.Amount>
      <styledEl.PairLabel>
        <Trans>
          {quoteSymbol} per {baseSymbol}
        </Trans>
      </styledEl.PairLabel>
    </styledEl.Root>
  )
}
