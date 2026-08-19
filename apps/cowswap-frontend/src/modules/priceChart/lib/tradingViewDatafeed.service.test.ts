import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createPriceChartDatafeed } from './tradingViewDatafeed.service'

import { fetchPriceChartData, fetchTokenSupply } from '../api'

import type { LibrarySymbolInfo, ResolutionString, SearchSymbolResultItem } from './charting_library'
import type { PriceChartAssetDescriptor, PriceChartSymbolDescriptor } from './tradingView.types'

jest.mock('../api', () => ({
  fetchPriceChartData: jest.fn(),
  fetchTokenSupply: jest.fn(),
}))

const mockedFetchPriceChartData = jest.mocked(fetchPriceChartData)
const mockedFetchTokenSupply = jest.mocked(fetchTokenSupply)

function createAsset(overrides: Partial<PriceChartAssetDescriptor>): PriceChartAssetDescriptor {
  return {
    address: '0xbase',
    chainId: SupportedChainId.MAINNET,
    symbol: 'TOKEN',
    ...overrides,
  }
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

function createSymbolDescriptor(baseAsset: PriceChartAssetDescriptor): PriceChartSymbolDescriptor {
  const ticker = `${baseAsset.symbol}USD`

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
    searchSymbol: {
      description: ticker,
      exchange: 'CoW Swap',
      full_name: ticker,
      symbol: ticker,
      ticker,
      type: 'spot crypto',
    } as SearchSymbolResultItem,
    selection: 'sell',
    ticker,
  }
}

function flushTasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
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
    mockedFetchTokenSupply.mockReset()
  })

  it('does not advertise unsupported server time', async () => {
    const onReady = jest.fn()
    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onStatusChange: jest.fn(),
      symbols: [],
    })

    datafeed.onReady(onReady)
    await flushTasks()

    expect(onReady).toHaveBeenCalledWith(expect.objectContaining({ supports_time: false }))
    expect(datafeed.getServerTime).toBeUndefined()
  })

  it('loads USD history and maps bars to TradingView format', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'USDC',
      }),
    )
    const onHistoryLoaded = jest.fn()
    const onStatusChange = jest.fn()
    const onResult = jest.fn()
    const onError = jest.fn()

    mockedFetchPriceChartData.mockResolvedValue([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        timestamp: 1710000000,
      },
    ])

    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onHistoryLoaded,
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(mockedFetchPriceChartData).toHaveBeenCalledWith({
      address: '0xbase',
      chainId: SupportedChainId.MAINNET,
      countback: 300,
      from: 1710000000,
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
        },
      ],
      { noData: false },
    )
    expect(onError).not.toHaveBeenCalled()
    expect(onStatusChange).toHaveBeenNthCalledWith(1, 'loading')
    expect(onStatusChange).toHaveBeenLastCalledWith(null)
    expect(onHistoryLoaded).toHaveBeenCalledWith([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        timestamp: 1710000000,
      },
    ])
    expect(mockedFetchTokenSupply).not.toHaveBeenCalled()
  })

  it('scales USD history by circulating supply for market cap', async () => {
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const onResult = jest.fn()

    mockedFetchPriceChartData.mockResolvedValue([{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }])
    mockedFetchTokenSupply.mockResolvedValue({ circulatingSupply: 100, totalSupply: 120 })

    const { datafeed } = createPriceChartDatafeed({
      metric: 'marketCap',
      onStatusChange: jest.fn(),
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, jest.fn())
    await flushTasks()

    expect(mockedFetchTokenSupply).toHaveBeenCalledWith(symbol.baseAsset)
    expect(onResult).toHaveBeenCalledWith([{ close: 200, high: 300, low: 100, open: 150, time: 1710000000000 }], {
      noData: false,
    })
  })

  it('shows loading only for the first request for a symbol', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'USDC',
      }),
    )
    const onStatusChange = jest.fn()

    mockedFetchPriceChartData.mockResolvedValue([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        timestamp: 1710000000,
      },
    ])

    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, jest.fn(), jest.fn())
    await flushTasks()
    datafeed.getBars(symbol.librarySymbolInfo, '1D' as ResolutionString, PERIOD_PARAMS, jest.fn(), jest.fn())
    await flushTasks()

    expect(onStatusChange.mock.calls.filter(([status]) => status === 'loading')).toEqual([['loading']])
  })

  it('shows an empty-state overlay when USD history is unavailable', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const onStatusChange = jest.fn()
    const onResult = jest.fn()
    const onError = jest.fn()
    mockedFetchPriceChartData.mockResolvedValue([])
    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(mockedFetchPriceChartData).toHaveBeenNthCalledWith(1, {
      address: '0xbase',
      chainId: SupportedChainId.MAINNET,
      countback: 300,
      from: 1710000000,
      resolution: '60',
      to: 1710007200,
    })
    expect(onResult).toHaveBeenCalledWith([], { noData: true })
    expect(onError).not.toHaveBeenCalled()
    expect(onStatusChange).toHaveBeenLastCalledWith('empty')
  })

  it('skips price chart calls for backfill requests when backfill is disabled', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const onStatusChange = jest.fn()
    const onResult = jest.fn()

    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '1D' as ResolutionString, BACKFILL_PERIOD_PARAMS, onResult, jest.fn())
    await flushTasks()

    expect(mockedFetchPriceChartData).not.toHaveBeenCalled()
    expect(onResult).toHaveBeenCalledWith([], { noData: true })
    expect(onStatusChange).not.toHaveBeenCalled()
  })
})

describe('createPriceChartDatafeed request lifecycle', () => {
  beforeEach(() => {
    mockedFetchPriceChartData.mockReset()
    mockedFetchTokenSupply.mockReset()
  })

  it('reports errors when all price chart requests fail', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const onStatusChange = jest.fn()
    const onResult = jest.fn()
    const onError = jest.fn()

    mockedFetchPriceChartData.mockRejectedValue(new Error('No access'))

    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onStatusChange,
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, onError)
    await flushTasks()

    expect(onResult).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith('No access')
    expect(onStatusChange).toHaveBeenLastCalledWith('error')
  })

  it('does not expose symbol search results', () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const onResult = jest.fn()

    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onStatusChange: jest.fn(),
      symbols: [symbol],
    })

    datafeed.searchSymbols('COW', '', '', onResult)

    expect(onResult).toHaveBeenCalledWith([])
  })

  it('completes overlapping requests while applying only the latest history', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const firstRequest = createDeferred<
      {
        close: number
        high: number
        low: number
        open: number
        timestamp: number
      }[]
    >()
    const secondRequest = createDeferred<
      {
        close: number
        high: number
        low: number
        open: number
        timestamp: number
      }[]
    >()
    const firstOnResult = jest.fn()
    const secondOnResult = jest.fn()
    const onHistoryLoaded = jest.fn()

    mockedFetchPriceChartData.mockReturnValueOnce(firstRequest.promise).mockReturnValueOnce(secondRequest.promise)

    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onHistoryLoaded,
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
        timestamp: 1710000000,
      },
    ])
    secondRequest.resolve([
      {
        close: 4,
        high: 5,
        low: 3,
        open: 3.5,
        timestamp: 1710003600,
      },
    ])
    await flushTasks()

    expect(firstOnResult).toHaveBeenCalledWith(
      [
        {
          close: 2,
          high: 3,
          low: 1,
          open: 1.5,
          time: 1710000000000,
        },
      ],
      { noData: false },
    )
    expect(secondOnResult).toHaveBeenCalledWith(
      [
        {
          close: 4,
          high: 5,
          low: 3,
          open: 3.5,
          time: 1710003600000,
        },
      ],
      { noData: false },
    )
    expect(onHistoryLoaded).toHaveBeenCalledTimes(1)
    expect(onHistoryLoaded).toHaveBeenCalledWith([
      {
        close: 4,
        high: 5,
        low: 3,
        open: 3.5,
        timestamp: 1710003600,
      },
    ])
  })
})
