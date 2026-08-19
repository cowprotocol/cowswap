import { getWrappedToken } from '@cowprotocol/common-utils'
import { getAddressKey, type SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import {
  PRO_CHART_EXCHANGE_NAME,
  PRO_CHART_SUPPORTED_RESOLUTIONS,
  PRO_CHART_SYMBOL_TYPE,
} from './tradingView.constants'

import type { PriceChartAssetDescriptor, PriceChartSelection, PriceChartSymbolDescriptor } from './tradingView.types'

export function createSwapChartSymbols(
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
): PriceChartSymbolDescriptor[] {
  if (!inputCurrency || !outputCurrency) {
    return []
  }

  const sellAsset = toCurrencyDescriptor(inputCurrency)
  const buyAsset = toCurrencyDescriptor(outputCurrency)
  const symbols = [buildSymbolDescriptor(sellAsset, 'sell'), buildSymbolDescriptor(buyAsset, 'buy')]

  return symbols.filter((symbol, index, array) => array.findIndex((item) => item.ticker === symbol.ticker) === index)
}

export function findChartSymbol(
  symbols: PriceChartSymbolDescriptor[],
  symbolName: string,
): PriceChartSymbolDescriptor | undefined {
  const normalizedSymbolName = symbolName.trim().toLowerCase()

  return symbols.find((symbol) => symbol.ticker.toLowerCase() === normalizedSymbolName)
}

function buildSymbolDescriptor(
  baseAsset: PriceChartAssetDescriptor,
  selection: PriceChartSelection,
): PriceChartSymbolDescriptor {
  const ticker = `${baseAsset.symbol}USD`
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
    searchSymbol: {
      description,
      exchange: PRO_CHART_EXCHANGE_NAME,
      full_name: ticker,
      symbol: ticker,
      ticker,
      type: PRO_CHART_SYMBOL_TYPE,
    },
    selection,
    ticker,
  }
}

function normalizeSymbol(value: string | null | undefined): string {
  if (!value) return 'TOKEN'

  return value.replace(/[^a-z0-9]/gi, '').toUpperCase() || 'TOKEN'
}

function toCurrencyDescriptor(currency: Currency): PriceChartAssetDescriptor {
  const address = getAddressKey(getWrappedToken(currency).address)
  const chainId = currency.chainId as SupportedChainId

  return {
    address,
    chainId,
    symbol: normalizeSymbol(currency.symbol),
  }
}
