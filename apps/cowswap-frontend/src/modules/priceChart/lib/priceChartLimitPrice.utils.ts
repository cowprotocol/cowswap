import { FractionUtils, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { Price } from '@cowprotocol/currency'
import type { Currency, Fraction } from '@cowprotocol/currency'

import { getPairInversion, currenciesMatch } from './priceChartCurrency.utils'

interface PriceChartUsdConversion {
  inputCurrency: Currency
  outputCurrency: Currency
  side: 'sell' | 'buy'
  counterUsdPrice: number
}

export function getActivePriceLimitLinePrice(
  limitPrice: Price<Currency, Currency> | null | undefined,
  conversion: PriceChartUsdConversion | null,
): number | null {
  if (!limitPrice || !conversion) return null
  const isInverted = getPairInversion(
    limitPrice.baseCurrency,
    limitPrice.quoteCurrency,
    conversion.inputCurrency,
    conversion.outputCurrency,
  )
  if (isInverted === null) return null
  const price = isInverted ? limitPrice.invert() : limitPrice

  const baseAmount = tryParseCurrencyAmount('1', price.baseCurrency)
  const rate = Number(baseAmount ? price.quote(baseAmount).toExact() : price.toSignificant(18))
  if (!isPositiveFiniteNumber(rate)) return null
  const value = conversion.side === 'buy' ? conversion.counterUsdPrice / rate : rate * conversion.counterUsdPrice
  return isPositiveFiniteNumber(value) ? value : null
}

export function getLimitPriceFromRate(
  inputCurrency: Currency,
  outputCurrency: Currency,
  rate: Fraction,
): Price<Currency, Currency> {
  const rawRate = FractionUtils.adjustDecimalsAtoms(
    FractionUtils.fractionLikeToFraction(rate),
    inputCurrency.decimals,
    outputCurrency.decimals,
  )
  return new Price(inputCurrency, outputCurrency, rawRate.denominator, rawRate.numerator)
}

export function getPriceChartUsdConversion(
  currency: Currency | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): PriceChartUsdConversion | null {
  if (!currency || !inputCurrency || !outputCurrency) return null
  if (currenciesMatch(currency, inputCurrency) && isPositiveFiniteNumber(outputUsdPrice)) {
    return { inputCurrency, outputCurrency, side: 'sell', counterUsdPrice: outputUsdPrice }
  }
  if (currenciesMatch(currency, outputCurrency) && isPositiveFiniteNumber(inputUsdPrice)) {
    return { inputCurrency, outputCurrency, side: 'buy', counterUsdPrice: inputUsdPrice }
  }
  return null
}

export function getSelectedPriceLimitRate(
  selectedPrice: number,
  conversion: PriceChartUsdConversion | null,
): Fraction | null {
  if (!conversion || !isPositiveFiniteNumber(selectedPrice)) return null

  const rate =
    conversion.side === 'buy' ? conversion.counterUsdPrice / selectedPrice : selectedPrice / conversion.counterUsdPrice
  return isPositiveFiniteNumber(rate) ? FractionUtils.fromNumber(rate) : null
}

function isPositiveFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
