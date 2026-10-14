import { ReactNode } from 'react'

import { Currency, Price } from '@cowprotocol/currency'
import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './TwapExecutionPrice.styled'

export interface TwapExecutionPriceProps {
  className?: string
  executionPrice: Price<Currency, Currency> | null
  inputCurrency: Currency | null
  outputCurrency: Currency | null
  isInverted: boolean
  hideAmount?: boolean
}

export function TwapExecutionPrice({
  className,
  executionPrice,
  inputCurrency,
  outputCurrency,
  isInverted,
  hideAmount = false,
}: TwapExecutionPriceProps): ReactNode {
  const displayedPrice = executionPrice ? (isInverted ? executionPrice.invert() : executionPrice) : null
  const quoteCurrency = displayedPrice?.quoteCurrency ?? (isInverted ? inputCurrency : outputCurrency)
  const baseCurrency = displayedPrice?.baseCurrency ?? (isInverted ? outputCurrency : inputCurrency)
  const quoteSymbol = quoteCurrency?.symbol ?? ''
  const baseSymbol = baseCurrency?.symbol ?? ''
  const showPair = quoteSymbol !== '' && baseSymbol !== ''

  return (
    <styledEl.Root className={className}>
      <styledEl.Amount>
        {displayedPrice && !hideAmount ? <TokenAmount amount={displayedPrice} hideTokenSymbol /> : '0'}
      </styledEl.Amount>
      {showPair && (
        <styledEl.PairLabel>
          <Trans>
            {quoteSymbol} per {baseSymbol}
          </Trans>
        </styledEl.PairLabel>
      )}
    </styledEl.Root>
  )
}
