import { FractionUtils, getWrappedToken, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { Price } from '@cowprotocol/currency'
import type { Currency, Fraction } from '@cowprotocol/currency'

// eslint-disable-next-line complexity
export function getActivePriceLimitLinePrice(
  currency: Currency | undefined,
  limitPrice: Price<Currency, Currency> | null | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): number | null {
  if (!limitPrice || !inputCurrency || !outputCurrency) return null
  const conversion = getUsdConversion(currency, inputCurrency, outputCurrency, inputUsdPrice, outputUsdPrice)
  if (!conversion) return null

  const price = matchesPair(limitPrice, inputCurrency, outputCurrency)
    ? limitPrice
    : matchesPair(limitPrice, outputCurrency, inputCurrency)
      ? limitPrice.invert()
      : null
  if (!price) return null

  const baseAmount = tryParseCurrencyAmount('1', price.baseCurrency)
  const rate = Number(baseAmount ? price.quote(baseAmount).toExact() : price.toSignificant(18))
  if (!isPositiveFiniteNumber(rate)) return null
  const value = conversion.inverted ? conversion.counterUsdPrice / rate : rate * conversion.counterUsdPrice
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

export function getSelectedPriceLimitRate(
  currency: Currency | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
  selectedPrice: number,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): Fraction | null {
  if (!isPositiveFiniteNumber(selectedPrice)) return null
  const conversion = getUsdConversion(currency, inputCurrency, outputCurrency, inputUsdPrice, outputUsdPrice)
  if (!conversion) return null

  const rate = conversion.inverted
    ? conversion.counterUsdPrice / selectedPrice
    : selectedPrice / conversion.counterUsdPrice
  return isPositiveFiniteNumber(rate) ? FractionUtils.fromNumber(rate) : null
}

function getUsdConversion(
  currency: Currency | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): { inverted: boolean; counterUsdPrice: number } | null {
  if (!currency || !inputCurrency || !outputCurrency) return null
  if (matchesCurrency(currency, inputCurrency) && isPositiveFiniteNumber(outputUsdPrice)) {
    return { inverted: false, counterUsdPrice: outputUsdPrice }
  }
  if (matchesCurrency(currency, outputCurrency) && isPositiveFiniteNumber(inputUsdPrice)) {
    return { inverted: true, counterUsdPrice: inputUsdPrice }
  }
  return null
}

function isPositiveFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function matchesCurrency(currency: Currency, other: Currency): boolean {
  return getWrappedToken(currency).equals(getWrappedToken(other))
}

function matchesPair(price: Price<Currency, Currency>, base: Currency, quote: Currency): boolean {
  return matchesCurrency(price.baseCurrency, base) && matchesCurrency(price.quoteCurrency, quote)
}
