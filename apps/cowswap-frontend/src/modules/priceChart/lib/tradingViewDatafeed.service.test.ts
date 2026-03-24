import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createPriceChartDatafeed } from './tradingViewDatafeed.service'

import { fetchPriceChartData } from '../api'

import type { LibrarySymbolInfo, ResolutionString, SearchSymbolResultItem } from './charting_library'
import type { PriceChartCurrencyDescriptor, PriceChartSymbolDescriptor } from './tradingView.types'

jest.mock('../api', () => ({
  fetchPriceChartData: jest.fn(),
}))

const mockedFetchPriceChartData = jest.mocked(fetchPriceChartData)

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

function flushTasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function createDeferred<T>(): { promise: Promise<T>; reject: (error?: unknown) => void; resolve: (value: T) => void } {
  let resolvePromise!: (value: T) => void
  let rejectPromise!: (error?: unknown) => void

  return {
    promise: new Promise<T>((resolve, reject) => {
      resolvePromise = resolve
      rejectPromise = reject
    }),
    reject: rejectPromise,
    resolve: resolvePromise,
  }
}

const PERIOD_PARAMS = {
  countBack: 300,
  firstDataRequest: true,
  from: 1710000000,
  to: 1710007200,
}

const BACKFILL_PERIOD_PARAMS = {
  ...PERIOD_PARAMS,
  firstDataRequest: false,
}

describe('createPriceChartDatafeed', () => {
  beforeEach(() => {
    mockedFetchPriceChartData.mockReset()
  })

  it('loads USD history and maps bars to TradingView format', async () => {
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
    const onStatusChange = jest.fn()
    const onResult = jest.fn()
    const onError = jest.fn()

    mockedFetchPriceChartData.mockResolvedValue([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        status: 'ok',
        time: 1710000000,
        volume: '42.5',
      },
    ])

    const { datafeed } = createPriceChartDatafeed({
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(mockedFetchPriceChartData).toHaveBeenCalledWith({
      address: '0xbase',
      chainId: SupportedChainId.MAINNET,
      countback: 300,
      currencyCode: 'USD',
      from: 1710000000,
      removeEmptyBars: true,
      removeLeadingNullValues: true,
      resolution: '60',
      to: 1710007200,
    })
    expect(onResult).toHaveBeenCalledWith(
      [
        {
          close: 2,
          high: 3,
          low: 1,
          open: 1.5,
          time: 1710000000000,
          volume: 42.5,
        },
      ],
      { noData: false },
    )
    expect(onError).not.toHaveBeenCalled()
    expect(onStatusChange).toHaveBeenNthCalledWith(1, {
      kind: 'loading',
      message: 'Loading USDCUSD history.',
      ticker: 'USDCUSD',
    })
    expect(onStatusChange).toHaveBeenLastCalledWith({
      kind: 'ready',
      message: 'Price history loaded for USDCUSD.',
      ticker: 'USDCUSD',
    })
  })

  it('loads token pair history', async () => {
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
    const onStatusChange = jest.fn()
    const onResult = jest.fn()
    const onError = jest.fn()

    mockedFetchPriceChartData.mockResolvedValue([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        status: 'ok',
        time: 1710000000,
        volume: '42.5',
      },
    ])

    const { datafeed } = createPriceChartDatafeed({
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(mockedFetchPriceChartData).toHaveBeenCalledWith({
      address: '0xbase',
      chainId: SupportedChainId.MAINNET,
      countback: 300,
      currencyCode: 'TOKEN',
      from: 1710000000,
      removeEmptyBars: true,
      removeLeadingNullValues: true,
      resolution: '60',
      to: 1710007200,
    })
    expect(onResult).toHaveBeenCalledWith(
      [
        {
          close: 2,
          high: 3,
          low: 1,
          open: 1.5,
          time: 1710000000000,
          volume: 42.5,
        },
      ],
      { noData: false },
    )
    expect(onError).not.toHaveBeenCalled()
    expect(onStatusChange).toHaveBeenLastCalledWith({
      kind: 'ready',
      message: 'Price history loaded for COWETH.',
      ticker: 'COWETH',
    })
  })

  it('shows an empty-state overlay when pair history is unavailable', async () => {
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
    const onStatusChange = jest.fn()
    const onResult = jest.fn()
    const onError = jest.fn()
    mockedFetchPriceChartData.mockResolvedValue([])
    const { datafeed } = createPriceChartDatafeed({
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(mockedFetchPriceChartData).toHaveBeenCalledWith({
      address: '0xbase',
      chainId: SupportedChainId.MAINNET,
      countback: 300,
      currencyCode: 'TOKEN',
      from: 1710000000,
      removeEmptyBars: true,
      removeLeadingNullValues: true,
      resolution: '60',
      to: 1710007200,
    })
    expect(onResult).toHaveBeenCalledWith([], { noData: true })
    expect(onError).not.toHaveBeenCalled()
    expect(onStatusChange).toHaveBeenLastCalledWith({
      kind: 'empty',
      message: 'No price history found for COWETH.',
      ticker: 'COWETH',
    })
  })

  it('skips Codex calls for backfill requests when backfill is disabled', async () => {
    const symbol = createSymbolDescriptor(
      createCurrency({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
      createCurrency({
        kind: 'usd',
        key: 'usd',
        name: 'US Dollar',
        symbol: 'USD',
      }),
    )
    const onStatusChange = jest.fn()
    const onResult = jest.fn()

    const { datafeed } = createPriceChartDatafeed({
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '1D' as ResolutionString, BACKFILL_PERIOD_PARAMS, onResult, jest.fn())
    await flushTasks()

    expect(mockedFetchPriceChartData).not.toHaveBeenCalled()
    expect(onResult).toHaveBeenCalledWith([], { noData: true })
    expect(onStatusChange).not.toHaveBeenCalled()
  })

  it('reports errors when all Codex requests fail', async () => {
    const symbol = createSymbolDescriptor(
      createCurrency({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
      createCurrency({
        kind: 'usd',
        key: 'usd',
        name: 'US Dollar',
        symbol: 'USD',
      }),
    )
    const onStatusChange = jest.fn()
    const onResult = jest.fn()
    const onError = jest.fn()

    mockedFetchPriceChartData.mockRejectedValue(new Error('No access'))

    const { datafeed } = createPriceChartDatafeed({
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(onResult).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith('No access')
    expect(onStatusChange).toHaveBeenLastCalledWith({
      kind: 'error',
      message: 'Failed to load COWUSD history.',
      ticker: 'COWUSD',
    })
  })

  it('does not expose symbol search results', () => {
    const symbol = createSymbolDescriptor(
      createCurrency({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
      createCurrency({
        kind: 'usd',
        key: 'usd',
        name: 'US Dollar',
        symbol: 'USD',
      }),
    )
    const onResult = jest.fn()

    const { datafeed } = createPriceChartDatafeed({
      onStatusChange: jest.fn(),
      symbols: [symbol],
    })

    datafeed.searchSymbols('COW', '', '', onResult)

    expect(onResult).toHaveBeenCalledWith([])
  })

  it('drops stale responses after a newer request for the same ticker', async () => {
    const symbol = createSymbolDescriptor(
      createCurrency({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
      createCurrency({
        kind: 'usd',
        key: 'usd',
        name: 'US Dollar',
        symbol: 'USD',
      }),
    )
    const firstRequest = createDeferred<
      {
        close: number
        high: number
        low: number
        open: number
        status: string
        time: number
        volume: string
      }[]
    >()
    const secondRequest = createDeferred<
      {
        close: number
        high: number
        low: number
        open: number
        status: string
        time: number
        volume: string
      }[]
    >()
    const firstOnResult = jest.fn()
    const secondOnResult = jest.fn()

    mockedFetchPriceChartData.mockReturnValueOnce(firstRequest.promise).mockReturnValueOnce(secondRequest.promise)

    const { datafeed } = createPriceChartDatafeed({
      onStatusChange: jest.fn(),
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, firstOnResult, jest.fn())
    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, secondOnResult, jest.fn())

    firstRequest.resolve([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        status: 'ok',
        time: 1710000000,
        volume: '10',
      },
    ])
    secondRequest.resolve([
      {
        close: 4,
        high: 5,
        low: 3,
        open: 3.5,
        status: 'ok',
        time: 1710003600,
        volume: '20',
      },
    ])
    await flushTasks()

    expect(firstOnResult).not.toHaveBeenCalled()
    expect(secondOnResult).toHaveBeenCalledWith(
      [
        {
          close: 4,
          high: 5,
          low: 3,
          open: 3.5,
          time: 1710003600000,
          volume: 20,
        },
      ],
      { noData: false },
    )
  })
})
