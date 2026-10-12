import { getWrappedToken, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { Fraction, Price } from '@cowprotocol/currency'
import type { Currency } from '@cowprotocol/currency'

import F from 'fraction.js'

export function getActivePriceLimitLinePrice(
  currency: Currency | undefined,
  limitPrice: Price<Currency, Currency> | null | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): number | null {
  if (!currency) {
    return null
  }

  return getActiveUsdLimitLinePrice(currency, limitPrice, inputCurrency, outputCurrency, inputUsdPrice, outputUsdPrice)
}

export function getLimitPriceFromRate(
  inputCurrency: Currency,
  outputCurrency: Currency,
  rate: Fraction,
): Price<Currency, Currency> | null {
  const baseAmount = tryParseCurrencyAmount(rate.denominator.toString(), inputCurrency)
  const quoteAmount = tryParseCurrencyAmount(rate.numerator.toString(), outputCurrency)

  return baseAmount && quoteAmount ? new Price({ baseAmount, quoteAmount }) : null
}

export function getSelectedPriceLimitRate(
  currency: Currency | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
  selectedPrice: number,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): Fraction | null {
  if (!currency) {
    return null
  }

  if (!inputCurrency || !outputCurrency) {
    return null
  }

  if (!isPositiveFiniteNumber(selectedPrice)) {
    return null
  }

  return getSelectedUsdLimitRate(currency, inputCurrency, outputCurrency, selectedPrice, inputUsdPrice, outputUsdPrice)
}

function getActiveUsdLimitLinePrice(
  currency: Currency,
  limitPrice: Price<Currency, Currency> | null | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): number | null {
  const canonicalLimitRate = getCanonicalLimitRate(limitPrice, inputCurrency, outputCurrency)

  if (!isPositiveFiniteNumber(canonicalLimitRate)) {
    return null
  }

  const isInputUsdTicker = isMatchingOptionalAsset(inputCurrency, getWrappedToken(currency))
  const isOutputUsdTicker = isMatchingOptionalAsset(outputCurrency, getWrappedToken(currency))

  if (isInputUsdTicker && isPositiveFiniteNumber(outputUsdPrice)) {
    return canonicalLimitRate * outputUsdPrice
  }

  if (isOutputUsdTicker && isPositiveFiniteNumber(inputUsdPrice)) {
    return inputUsdPrice / canonicalLimitRate
  }

  return null
}

function getCanonicalLimitRate(
  limitPrice: Price<Currency, Currency> | null | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
): number | null {
  if (!limitPrice) {
    return null
  }

  if (!inputCurrency || !outputCurrency) {
    return null
  }

  if (isMatchingCurrencyPair(limitPrice, inputCurrency, outputCurrency)) {
    return getPriceValue(limitPrice)
  }

  if (isMatchingCurrencyPair(limitPrice, outputCurrency, inputCurrency)) {
    return getPriceValue(limitPrice.invert())
  }

  return null
}

function getPriceValue(price: Price<Currency, Currency>): number | null {
  const baseAmount = tryParseCurrencyAmount('1', price.baseCurrency)
  const quoteAmount = baseAmount ? price.quote(baseAmount) : null
  const parsedPrice = quoteAmount ? Number(quoteAmount.toExact()) : Number(price.toSignificant(18))

  return Number.isFinite(parsedPrice) ? parsedPrice : null
}

function getSelectedUsdLimitRate(
  currency: Currency,
  inputCurrency: Currency,
  outputCurrency: Currency,
  selectedPrice: number,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): Fraction | null {
  const isInputUsdTicker = isMatchingAsset(inputCurrency, getWrappedToken(currency))
  const isOutputUsdTicker = isMatchingAsset(outputCurrency, getWrappedToken(currency))

  if (isInputUsdTicker && isPositiveFiniteNumber(outputUsdPrice)) {
    return toExactFraction(selectedPrice / outputUsdPrice)
  }

  if (isOutputUsdTicker && isPositiveFiniteNumber(inputUsdPrice)) {
    return toExactFraction(inputUsdPrice / selectedPrice)
  }

  return null
}

function isMatchingAsset(currency: Currency, asset: ReturnType<typeof getWrappedToken>): boolean {
  const wrappedCurrency = getWrappedToken(currency)

  return wrappedCurrency.chainId === asset.chainId && areAddressesEqual(wrappedCurrency.address, asset.address)
}

function isMatchingCurrency(currency: Currency, expectedCurrency: Currency): boolean {
  const wrappedCurrency = getWrappedToken(currency)
  const wrappedExpectedCurrency = getWrappedToken(expectedCurrency)

  return (
    wrappedCurrency.chainId === wrappedExpectedCurrency.chainId &&
    areAddressesEqual(wrappedCurrency.address, wrappedExpectedCurrency.address)
  )
}

function isMatchingCurrencyPair(
  price: Price<Currency, Currency>,
  baseCurrency: Currency,
  quoteCurrency: Currency,
): boolean {
  return isMatchingCurrency(price.baseCurrency, baseCurrency) && isMatchingCurrency(price.quoteCurrency, quoteCurrency)
}

function isMatchingOptionalAsset(currency: Currency | null, asset: ReturnType<typeof getWrappedToken>): boolean {
  return currency ? isMatchingAsset(currency, asset) : false
}

function isPositiveFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function toExactFraction(value: number): Fraction | null {
  if (!Number.isFinite(value) || value <= 0) {
    return null
  }

  const { d: denominator, n: numerator } = new F(value)

  return new Fraction(numerator, denominator)
}
