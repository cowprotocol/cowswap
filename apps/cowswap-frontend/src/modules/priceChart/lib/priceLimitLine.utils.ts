import { getWrappedToken, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { Fraction } from '@cowprotocol/currency'
import type { Currency, Price } from '@cowprotocol/currency'

import F from 'fraction.js'

import type { PriceChartSymbolDescriptor } from './tradingView.types'

export function getActivePriceLimitLinePrice(
  activeTicker: string,
  symbols: PriceChartSymbolDescriptor[],
  limitPrice: Price<Currency, Currency> | null | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): number | null {
  const symbol = symbols.find((item) => item.ticker === activeTicker)

  if (!symbol) {
    return null
  }

  const displayedLimitPrice = getDisplayedLimitPrice(symbol, limitPrice)

  if (displayedLimitPrice) {
    return getPriceValue(displayedLimitPrice)
  }

  return getActiveUsdLimitLinePrice(symbol, limitPrice, inputCurrency, outputCurrency, inputUsdPrice, outputUsdPrice)
}

export function getSelectedPriceLimitRate(
  activeTicker: string,
  symbols: PriceChartSymbolDescriptor[],
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
  selectedPrice: number,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): Fraction | null {
  const symbol = symbols.find((item) => item.ticker === activeTicker)

  if (!symbol) {
    return null
  }

  if (!inputCurrency || !outputCurrency) {
    return null
  }

  if (!isPositiveFiniteNumber(selectedPrice)) {
    return null
  }

  if (symbol.quoteAsset.kind === 'token') {
    return getSelectedTokenLimitRate(symbol, inputCurrency, outputCurrency, selectedPrice)
  }

  return getSelectedUsdLimitRate(symbol, inputCurrency, outputCurrency, selectedPrice, inputUsdPrice, outputUsdPrice)
}

function getActiveUsdLimitLinePrice(
  symbol: PriceChartSymbolDescriptor,
  limitPrice: Price<Currency, Currency> | null | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): number | null {
  if (symbol.quoteAsset.kind !== 'usd') {
    return null
  }

  const canonicalLimitRate = getCanonicalLimitRate(limitPrice, inputCurrency, outputCurrency)

  if (!isPositiveFiniteNumber(canonicalLimitRate)) {
    return null
  }

  const isInputUsdTicker = isMatchingOptionalAsset(inputCurrency, symbol.baseAsset)
  const isOutputUsdTicker = isMatchingOptionalAsset(outputCurrency, symbol.baseAsset)

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

function getDisplayedLimitPrice(
  symbol: PriceChartSymbolDescriptor | undefined,
  limitPrice: Price<Currency, Currency> | null | undefined,
): Price<Currency, Currency> | null {
  if (!symbol || !limitPrice || symbol.quoteAsset.kind !== 'token') {
    return null
  }

  if (isMatchingAssetPair(limitPrice, symbol.baseAsset, symbol.quoteAsset)) {
    return limitPrice
  }

  if (isMatchingAssetPair(limitPrice, symbol.quoteAsset, symbol.baseAsset)) {
    return limitPrice.invert()
  }

  return null
}

function getPriceValue(price: Price<Currency, Currency>): number | null {
  const baseAmount = tryParseCurrencyAmount('1', price.baseCurrency)
  const quoteAmount = baseAmount ? price.quote(baseAmount) : null
  const parsedPrice = quoteAmount ? Number(quoteAmount.toExact()) : Number(price.toSignificant(18))

  return Number.isFinite(parsedPrice) ? parsedPrice : null
}

function getSelectedTokenLimitRate(
  symbol: PriceChartSymbolDescriptor,
  inputCurrency: Currency,
  outputCurrency: Currency,
  selectedPrice: number,
): Fraction | null {
  if (
    isMatchingAssetPair(
      { baseCurrency: inputCurrency, quoteCurrency: outputCurrency },
      symbol.baseAsset,
      symbol.quoteAsset,
    )
  ) {
    return toExactFraction(selectedPrice)
  }

  if (
    isMatchingAssetPair(
      { baseCurrency: inputCurrency, quoteCurrency: outputCurrency },
      symbol.quoteAsset,
      symbol.baseAsset,
    )
  ) {
    return toExactFraction(1 / selectedPrice)
  }

  return null
}

function getSelectedUsdLimitRate(
  symbol: PriceChartSymbolDescriptor,
  inputCurrency: Currency,
  outputCurrency: Currency,
  selectedPrice: number,
  inputUsdPrice: number | null,
  outputUsdPrice: number | null,
): Fraction | null {
  const isInputUsdTicker = isMatchingAsset(inputCurrency, symbol.baseAsset)
  const isOutputUsdTicker = isMatchingAsset(outputCurrency, symbol.baseAsset)

  if (isInputUsdTicker && isPositiveFiniteNumber(outputUsdPrice)) {
    return toExactFraction(selectedPrice / outputUsdPrice)
  }

  if (isOutputUsdTicker && isPositiveFiniteNumber(inputUsdPrice)) {
    return toExactFraction(inputUsdPrice / selectedPrice)
  }

  return null
}

function isMatchingAsset(currency: Currency, asset: PriceChartSymbolDescriptor['baseAsset']): boolean {
  const wrappedCurrency = getWrappedToken(currency)

  return wrappedCurrency.chainId === asset.chainId && wrappedCurrency.address.toLowerCase() === asset.address
}

function isMatchingAssetPair(
  price: Pick<Price<Currency, Currency>, 'baseCurrency' | 'quoteCurrency'>,
  baseAsset: PriceChartSymbolDescriptor['baseAsset'],
  quoteAsset: PriceChartSymbolDescriptor['baseAsset'],
): boolean {
  return isMatchingAsset(price.baseCurrency, baseAsset) && isMatchingAsset(price.quoteCurrency, quoteAsset)
}

function isMatchingCurrency(currency: Currency, expectedCurrency: Currency): boolean {
  const wrappedCurrency = getWrappedToken(currency)
  const wrappedExpectedCurrency = getWrappedToken(expectedCurrency)

  return (
    wrappedCurrency.chainId === wrappedExpectedCurrency.chainId &&
    wrappedCurrency.address.toLowerCase() === wrappedExpectedCurrency.address.toLowerCase()
  )
}

function isMatchingCurrencyPair(
  price: Price<Currency, Currency>,
  baseCurrency: Currency,
  quoteCurrency: Currency,
): boolean {
  return isMatchingCurrency(price.baseCurrency, baseCurrency) && isMatchingCurrency(price.quoteCurrency, quoteCurrency)
}

function isMatchingOptionalAsset(currency: Currency | null, asset: PriceChartSymbolDescriptor['baseAsset']): boolean {
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
