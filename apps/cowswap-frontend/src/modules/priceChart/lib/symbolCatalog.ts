import { getWrappedToken } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import {
  PRO_CHART_EXCHANGE_NAME,
  PRO_CHART_SUPPORTED_RESOLUTIONS,
  PRO_CHART_SYMBOL_TYPE,
  PRO_CHART_USD_ASSET,
} from './tradingView.constants'

import type { PriceChartCurrencyDescriptor, PriceChartFormat, PriceChartSymbolDescriptor } from './tradingView.types'

const DEFAULT_PRICE_CHART_FORMAT: PriceChartFormat = 3

function normalizeSymbol(value: string | null | undefined): string {
  if (!value) return 'TOKEN'

  return value.replace(/[^a-z0-9]/gi, '').toUpperCase() || 'TOKEN'
}

function toCurrencyDescriptor(currency: Currency): PriceChartCurrencyDescriptor {
  const address = getWrappedToken(currency).address.toLowerCase()
  const chainId = currency.chainId as SupportedChainId
  const key = `${chainId}:${address}`

  return {
    address,
    chainId,
    kind: 'token',
    key,
    name: currency.name || currency.symbol || key,
    symbol: normalizeSymbol(currency.symbol),
  }
}

function buildSymbolDescriptor(
  baseAsset: PriceChartCurrencyDescriptor,
  quoteAsset: PriceChartCurrencyDescriptor,
  selectionId: PriceChartFormat,
): PriceChartSymbolDescriptor {
  const ticker = `${baseAsset.symbol}${quoteAsset.symbol}`
  const description = ticker

  return {
    baseAsset,
    description,
    librarySymbolInfo: {
      data_status: 'streaming',
      description,
      exchange: PRO_CHART_EXCHANGE_NAME,
      format: 'price',
      full_name: ticker,
      has_daily: true,
      has_intraday: true,
      has_weekly_and_monthly: true,
      listed_exchange: PRO_CHART_EXCHANGE_NAME,
      minmov: 1,
      name: ticker,
      pricescale: 1000000,
      session: '24x7',
      supported_resolutions: PRO_CHART_SUPPORTED_RESOLUTIONS,
      ticker,
      timezone: 'Etc/UTC',
      type: PRO_CHART_SYMBOL_TYPE,
      visible_plots_set: 'ohlcv',
      volume_precision: 2,
    },
    quoteAsset,
    searchSymbol: {
      description,
      exchange: PRO_CHART_EXCHANGE_NAME,
      full_name: ticker,
      symbol: ticker,
      ticker,
      type: PRO_CHART_SYMBOL_TYPE,
    },
    selectionId,
    ticker,
  }
}

export function createSwapChartSymbols(
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
): PriceChartSymbolDescriptor[] {
  if (!inputCurrency || !outputCurrency) {
    return []
  }

  const sellAsset = toCurrencyDescriptor(inputCurrency)
  const buyAsset = toCurrencyDescriptor(outputCurrency)
  const symbols = [
    buildSymbolDescriptor(sellAsset, PRO_CHART_USD_ASSET, 1),
    buildSymbolDescriptor(buyAsset, PRO_CHART_USD_ASSET, 2),
    buildSymbolDescriptor(sellAsset, buyAsset, DEFAULT_PRICE_CHART_FORMAT),
    buildSymbolDescriptor(buyAsset, sellAsset, 4),
  ]

  return symbols.filter((symbol, index, array) => array.findIndex((item) => item.ticker === symbol.ticker) === index)
}

export function getDefaultPriceChartFormat(symbols: PriceChartSymbolDescriptor[]): PriceChartFormat | undefined {
  return (
    symbols.find((symbol) => symbol.selectionId === DEFAULT_PRICE_CHART_FORMAT)?.selectionId || symbols[0]?.selectionId
  )
}

export function getChartTickerByFormat(
  symbols: PriceChartSymbolDescriptor[],
  format: PriceChartFormat | undefined,
): string | undefined {
  if (!format) return undefined

  return symbols.find((symbol) => symbol.selectionId === format)?.ticker
}

export function getChartFormatByTicker(
  symbols: PriceChartSymbolDescriptor[],
  ticker: string,
): PriceChartFormat | undefined {
  return symbols.find((symbol) => symbol.ticker === ticker)?.selectionId
}

export function findChartSymbol(
  symbols: PriceChartSymbolDescriptor[],
  symbolName: string,
): PriceChartSymbolDescriptor | undefined {
  const normalizedSymbolName = symbolName.trim().toLowerCase()

  return symbols.find((symbol) => symbol.ticker.toLowerCase() === normalizedSymbolName)
}
