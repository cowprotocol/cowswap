import { getWrappedToken, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { Fraction } from '@cowprotocol/currency'
import type { Currency, Price } from '@cowprotocol/currency'

import F from 'fraction.js'

import type { PriceChartSymbolDescriptor } from './tradingView.types'

function isMatchingAsset(currency: Currency, asset: PriceChartSymbolDescriptor['baseAsset']): boolean {
  const wrappedCurrency = getWrappedToken(currency)

  return wrappedCurrency.chainId === asset.chainId && wrappedCurrency.address.toLowerCase() === asset.address
}

function getCanonicalLimitRate(
  limitPrice: Price<Currency, Currency> | null | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
): number | null {
  if (!limitPrice || !inputCurrency || !outputCurrency) {
    return null
  }

  if (
    isMatchingAsset(limitPrice.baseCurrency, {
      address: getWrappedToken(inputCurrency).address.toLowerCase(),
      chainId: inputCurrency.chainId,
      kind: 'token',
      key: '',
      name: '',
      symbol: '',
    }) &&
    isMatchingAsset(limitPrice.quoteCurrency, {
      address: getWrappedToken(outputCurrency).address.toLowerCase(),
      chainId: outputCurrency.chainId,
      kind: 'token',
      key: '',
      name: '',
      symbol: '',
    })
  ) {
    const baseAmount = tryParseCurrencyAmount('1', limitPrice.baseCurrency)
    const quoteAmount = baseAmount ? limitPrice.quote(baseAmount) : null
    const parsedPrice = quoteAmount ? Number(quoteAmount.toExact()) : Number(limitPrice.toSignificant(18))

    return Number.isFinite(parsedPrice) ? parsedPrice : null
  }

  if (
    isMatchingAsset(limitPrice.baseCurrency, {
      address: getWrappedToken(outputCurrency).address.toLowerCase(),
      chainId: outputCurrency.chainId,
      kind: 'token',
      key: '',
      name: '',
      symbol: '',
    }) &&
    isMatchingAsset(limitPrice.quoteCurrency, {
      address: getWrappedToken(inputCurrency).address.toLowerCase(),
      chainId: inputCurrency.chainId,
      kind: 'token',
      key: '',
      name: '',
      symbol: '',
    })
  ) {
    const invertedPrice = limitPrice.invert()
    const baseAmount = tryParseCurrencyAmount('1', invertedPrice.baseCurrency)
    const quoteAmount = baseAmount ? invertedPrice.quote(baseAmount) : null
    const parsedPrice = quoteAmount ? Number(quoteAmount.toExact()) : Number(invertedPrice.toSignificant(18))

    return Number.isFinite(parsedPrice) ? parsedPrice : null
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

  if (
    isMatchingAsset(limitPrice.baseCurrency, symbol.baseAsset) &&
    isMatchingAsset(limitPrice.quoteCurrency, symbol.quoteAsset)
  ) {
    return limitPrice
  }

  if (
    isMatchingAsset(limitPrice.baseCurrency, symbol.quoteAsset) &&
    isMatchingAsset(limitPrice.quoteCurrency, symbol.baseAsset)
  ) {
    return limitPrice.invert()
  }

  return null
}

function toExactFraction(value: number): Fraction | null {
  if (!Number.isFinite(value) || value <= 0) {
    return null
  }

  const { d: denominator, n: numerator } = new F(value)

  return new Fraction(numerator, denominator)
}

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
    const baseAmount = tryParseCurrencyAmount('1', displayedLimitPrice.baseCurrency)
    const quoteAmount = baseAmount ? displayedLimitPrice.quote(baseAmount) : null
    const parsedPrice = quoteAmount ? Number(quoteAmount.toExact()) : Number(displayedLimitPrice.toSignificant(18))

    return Number.isFinite(parsedPrice) ? parsedPrice : null
  }

  if (symbol.quoteAsset.kind !== 'usd') {
    return null
  }

  const canonicalLimitRate = getCanonicalLimitRate(limitPrice, inputCurrency, outputCurrency)

  if (!canonicalLimitRate || !Number.isFinite(canonicalLimitRate) || canonicalLimitRate <= 0) {
    return null
  }

  const isInputUsdTicker = inputCurrency ? isMatchingAsset(inputCurrency, symbol.baseAsset) : false
  const isOutputUsdTicker = outputCurrency ? isMatchingAsset(outputCurrency, symbol.baseAsset) : false

  if (isInputUsdTicker && outputUsdPrice && Number.isFinite(outputUsdPrice) && outputUsdPrice > 0) {
    return canonicalLimitRate * outputUsdPrice
  }

  if (isOutputUsdTicker && inputUsdPrice && Number.isFinite(inputUsdPrice) && inputUsdPrice > 0) {
    return inputUsdPrice / canonicalLimitRate
  }

  return null
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

  if (!symbol || !inputCurrency || !outputCurrency || !Number.isFinite(selectedPrice) || selectedPrice <= 0) {
    return null
  }

  const isDirectPair =
    isMatchingAsset(inputCurrency, symbol.baseAsset) && isMatchingAsset(outputCurrency, symbol.quoteAsset)
  const isInversePair =
    isMatchingAsset(inputCurrency, symbol.quoteAsset) && isMatchingAsset(outputCurrency, symbol.baseAsset)

  if (symbol.quoteAsset.kind === 'token' && isDirectPair) {
    return toExactFraction(selectedPrice)
  }

  if (symbol.quoteAsset.kind === 'token' && isInversePair) {
    return toExactFraction(1 / selectedPrice)
  }

  if (symbol.quoteAsset.kind !== 'usd') {
    return null
  }

  const isInputUsdTicker = isMatchingAsset(inputCurrency, symbol.baseAsset)
  const isOutputUsdTicker = isMatchingAsset(outputCurrency, symbol.baseAsset)

  if (isInputUsdTicker && outputUsdPrice && Number.isFinite(outputUsdPrice) && outputUsdPrice > 0) {
    return toExactFraction(selectedPrice / outputUsdPrice)
  }

  if (isOutputUsdTicker && inputUsdPrice && Number.isFinite(inputUsdPrice) && inputUsdPrice > 0) {
    return toExactFraction(inputUsdPrice / selectedPrice)
  }

  return null
}
