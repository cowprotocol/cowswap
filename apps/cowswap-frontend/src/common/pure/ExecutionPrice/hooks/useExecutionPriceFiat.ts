/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { Currency, CurrencyAmount, Price } from '@cowprotocol/common-entities'
import { rawToTokenAmount } from '@cowprotocol/common-utils'

import { useUsdAmount } from 'modules/usdAmount'

function getPriceQuoteAmount(price: Price<Currency, Currency>, isInverted: boolean): CurrencyAmount<Currency> {
  const executionPrice = isInverted ? price.invert() : price

  return CurrencyAmount.fromRawAmount(
    executionPrice.baseCurrency,
    rawToTokenAmount(1, executionPrice.baseCurrency.decimals),
  )
}

export function useExecutionPriceFiat(
  executionPrice: Price<Currency, Currency> | null,
  isInverted: boolean,
): CurrencyAmount<Currency> | null {
  const amount = executionPrice ? getPriceQuoteAmount(executionPrice, isInverted) : undefined

  return useUsdAmount(amount).value
}
