import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { rawToTokenAmount } from '@cow/utils/rawToTokenAmount'

function getPriceQuoteAmount(price: Price<Currency, Currency>, isInverted: boolean): CurrencyAmount<Currency> {
  const executionPrice = isInverted ? price.invert() : price

  return CurrencyAmount.fromRawAmount(
    executionPrice.baseCurrency,
    rawToTokenAmount(1, executionPrice.baseCurrency.decimals)
  )
}

export function useExecutionPriceFiat(
  executionPrice: Price<Currency, Currency> | null,
  isInverted: boolean
): CurrencyAmount<Currency> | null {
  const amount = executionPrice ? getPriceQuoteAmount(executionPrice, isInverted) : undefined

  return useHigherUSDValue(amount)
}
