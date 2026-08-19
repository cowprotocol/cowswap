import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createPriceChartDatafeed } from './tradingViewDatafeed.service'

import { fetchPriceChartData, fetchTokenSupply } from '../api'

import type { LibrarySymbolInfo, ResolutionString, SearchSymbolResultItem } from './charting_library'
import type { PriceChartBar } from './priceChart.types'
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

  it.each([
    ['price', 1_000_000_000_000],
    ['marketCap', 1],
  ] as const)('resolves %s history with its required precision', async (metric, pricescale) => {
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const onResolve = jest.fn()
    const { datafeed } = createPriceChartDatafeed({ metric, onStatusChange: jest.fn(), symbols: [symbol] })

    datafeed.resolveSymbol(symbol.ticker, onResolve, jest.fn())
    await flushTasks()

    expect(onResolve).toHaveBeenCalledWith(expect.objectContaining({ pricescale }))
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

  it('scales USD history by total supply when selected', async () => {
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const onResult = jest.fn()

    mockedFetchPriceChartData.mockResolvedValue([{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }])
    mockedFetchTokenSupply.mockResolvedValue({ circulatingSupply: 100, totalSupply: 120 })

    const { datafeed } = createPriceChartDatafeed({
      metric: 'marketCap',
      onStatusChange: jest.fn(),
      supplyBasis: 'total',
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, onResult, jest.fn())
    await flushTasks()

    expect(onResult).toHaveBeenCalledWith([{ close: 240, high: 360, low: 120, open: 180, time: 1710000000000 }], {
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

  it('does not let an older successful request replace newer history', async () => {
    const symbol = createSymbolDescriptor(
      createAsset({
        address: '0xbase',
        chainId: SupportedChainId.MAINNET,
        symbol: 'COW',
      }),
    )
    const firstRequest = createDeferred<PriceChartBar[]>()
    const secondRequest = createDeferred<PriceChartBar[]>()
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
    firstRequest.resolve([
      {
        close: 2,
        high: 3,
        low: 1,
        open: 1.5,
        timestamp: 1710000000,
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

  it('keeps successful history when a newer overlapping request fails', async () => {
    const symbol = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const firstRequest = createDeferred<PriceChartBar[]>()
    const secondRequest = createDeferred<PriceChartBar[]>()
    const onHistoryLoaded = jest.fn()
    const onError = jest.fn()
    const bars = [{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }]

    mockedFetchPriceChartData.mockReturnValueOnce(firstRequest.promise).mockReturnValueOnce(secondRequest.promise)

    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onHistoryLoaded,
      onStatusChange: jest.fn(),
      symbols: [symbol],
    })

    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, jest.fn(), jest.fn())
    datafeed.getBars(symbol.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, jest.fn(), onError)
    firstRequest.resolve(bars)
    secondRequest.reject(new Error('failed'))
    await flushTasks()

    expect(onHistoryLoaded).toHaveBeenCalledWith(bars)
    expect(onError).toHaveBeenCalledWith('failed')
  })

  it('restores successful history when its symbol becomes active again', async () => {
    const cow = createSymbolDescriptor(createAsset({ symbol: 'COW' }))
    const usdc = createSymbolDescriptor(createAsset({ symbol: 'USDC' }))
    const bars = [{ close: 2, high: 3, low: 1, open: 1.5, timestamp: 1710000000 }]
    const onHistoryLoaded = jest.fn()

    mockedFetchPriceChartData.mockResolvedValue(bars)

    const { datafeed } = createPriceChartDatafeed({
      metric: 'price',
      onHistoryLoaded,
      onStatusChange: jest.fn(),
      symbols: [cow, usdc],
    })

    datafeed.getBars(cow.librarySymbolInfo, '60' as ResolutionString, PERIOD_PARAMS, jest.fn(), jest.fn())
    await flushTasks()
    datafeed.resolveSymbol(usdc.ticker, jest.fn(), jest.fn())
    await flushTasks()
    datafeed.resolveSymbol(cow.ticker, jest.fn(), jest.fn())
    await flushTasks()

    expect(onHistoryLoaded).toHaveBeenCalledTimes(2)
    expect(onHistoryLoaded).toHaveBeenLastCalledWith(bars)
  })
})
