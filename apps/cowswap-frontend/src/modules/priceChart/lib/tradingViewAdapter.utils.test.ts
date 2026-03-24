import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  getResolvedPriceRequests,
  mapPriceChartBarsToTradingViewBars,
  mapResolutionToPriceChartResolution,
} from './tradingViewAdapter.utils'

import type { LibrarySymbolInfo, ResolutionString, SearchSymbolResultItem } from './charting_library'
import type { PriceChartBar } from './priceChart.types'
import type { PriceChartCurrencyDescriptor, PriceChartSymbolDescriptor } from './tradingView.types'

function createCurrency(overrides: Partial<PriceChartCurrencyDescriptor>): PriceChartCurrencyDescriptor {
  return {
    kind: 'token',
    key: '1:0xbase',
    name: 'Token',
    symbol: 'TOKEN',
    ...overrides,
  }
}

function createSymbolDescriptor(
  baseAsset: PriceChartCurrencyDescriptor,
  quoteAsset: PriceChartCurrencyDescriptor,
): PriceChartSymbolDescriptor {
  const ticker = `${baseAsset.symbol}${quoteAsset.symbol}`

  return {
    baseAsset,
    description: ticker,
    librarySymbolInfo: {
      description: ticker,
      exchange: 'CoW Swap',
      format: 'price',
      full_name: ticker,
      has_daily: true,
      has_intraday: true,
      has_weekly_and_monthly: true,
      listed_exchange: 'CoW Swap',
      minmov: 1,
      name: ticker,
      pricescale: 1000000,
      session: '24x7',
      ticker,
      timezone: 'Etc/UTC',
      type: 'spot crypto',
      visible_plots_set: 'ohlcv',
      volume_precision: 2,
    } as LibrarySymbolInfo,
    quoteAsset,
    searchSymbol: {
      description: ticker,
      exchange: 'CoW Swap',
      full_name: ticker,
      symbol: ticker,
      ticker,
      type: 'spot crypto',
    } as SearchSymbolResultItem,
    ticker,
  }
}

describe('priceChartAdapter.utils', () => {
  it('maps supported TradingView resolutions to price chart resolutions', () => {
    expect(mapResolutionToPriceChartResolution('1' as ResolutionString)).toBe('1')
    expect(mapResolutionToPriceChartResolution('1W' as ResolutionString)).toBe('7D')
    expect(mapResolutionToPriceChartResolution('30' as ResolutionString)).toBeNull()
  })

  it('maps price chart bars to TradingView bars', () => {
    const bars: PriceChartBar[] = [
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        status: 'ok',
        time: 1710000000,
        volume: '12.50',
      },
      {
        close: 4,
        high: 5,
        low: 3,
        open: 3.5,
        status: 'ok',
        time: 1710003600,
        volume: 'NaN',
      },
    ]

    expect(mapPriceChartBarsToTradingViewBars(bars)).toEqual([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        time: 1710000000000,
        volume: 12.5,
      },
      {
        close: 4,
        high: 5,
        low: 3,
        open: 3.5,
        time: 1710003600000,
        volume: undefined,
      },
    ])
  })

  it('builds a direct USD request for USD symbols', () => {
    const symbol = createSymbolDescriptor(
      createCurrency({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'USDC',
      }),
      createCurrency({
        kind: 'usd',
        key: 'usd',
        name: 'US Dollar',
        symbol: 'USD',
      }),
    )

    expect(getResolvedPriceRequests(symbol)).toEqual([
      {
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        currencyCode: 'USD',
        isFallback: false,
      },
    ])
  })

  it('tries token-quoted history first for pair symbols, then falls back to USD', () => {
    const symbol = createSymbolDescriptor(
      createCurrency({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
      createCurrency({
        address: '0xquote',
        chainId: SupportedChainId.MAINNET,
        symbol: 'ETH',
      }),
    )

    expect(getResolvedPriceRequests(symbol)).toEqual([
      {
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        currencyCode: 'TOKEN',
        isFallback: false,
      },
      {
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        currencyCode: 'USD',
        isFallback: true,
      },
    ])
  })
})
