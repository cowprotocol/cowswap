import { loadPriceChartHistory } from './loadPriceChartHistory.service'
import { findChartSymbol } from './symbolCatalog'
import {
  PRO_CHART_DISABLE_BACKFILL_REQUESTS,
  PRO_CHART_EXCHANGE_NAME,
  PRO_CHART_EXCHANGE_VALUE,
  PRO_CHART_SUPPORTED_RESOLUTIONS,
} from './tradingView.constants'
import { mapPriceChartBarsToTradingViewBars, mapResolutionToPriceChartResolution } from './tradingViewAdapter.utils'

import type { IBasicDataFeed, LibrarySymbolInfo, OnReadyCallback } from './charting_library'
import type { PriceChartBar, PriceChartMetric, PriceChartResolution } from './priceChart.types'
import type {
  CreatePriceChartDatafeedParams,
  PriceChartDatafeedController,
  PriceChartHistoryStatus,
  PriceChartSymbolDescriptor,
} from './tradingView.types'

type ErrorCallback = GetBarsParameters[4]

interface GetBarsHandlerParams {
  isDisposed: () => boolean
  latestRequestIdsByTicker: Map<string, number>
  metric: PriceChartMetric
  setHistory: (bars: PriceChartBar[], ticker: string) => void
  setActiveTicker: (ticker: string) => void
  setStatus: (status: PriceChartHistoryStatus, ticker: string) => void
  symbols: PriceChartSymbolDescriptor[]
}

type GetBarsParameters = Parameters<IBasicDataFeed['getBars']>
type HistoryCallback = GetBarsParameters[3]

interface HistoryLoaderParams {
  isLatestRequest: () => boolean
  onError: ErrorCallback
  onHistoryLoaded: (bars: PriceChartBar[]) => void
  onResult: HistoryCallback
  metric: PriceChartMetric
  periodParams: PeriodParams
  resolution: PriceChartResolution
  setStatus: (status: PriceChartHistoryStatus) => void
  symbol: PriceChartSymbolDescriptor
}

type PeriodParams = GetBarsParameters[2]

export function createPriceChartDatafeed({
  metric,
  onHistoryLoaded,
  onStatusChange,
  symbols,
}: CreatePriceChartDatafeedParams): PriceChartDatafeedController {
  let disposed = false
  let activeTicker: string | undefined
  const latestRequestIdsByTicker = new Map<string, number>()

  const setStatus = (status: PriceChartHistoryStatus, ticker: string): void => {
    if (disposed || ticker !== activeTicker) return

    onStatusChange(status)
  }

  const setHistory = (bars: PriceChartBar[], ticker: string): void => {
    if (disposed || ticker !== activeTicker) return

    onHistoryLoaded?.(bars)
  }

  return {
    datafeed: createBasicDatafeed({
      isDisposed: () => disposed,
      latestRequestIdsByTicker,
      metric,
      setHistory,
      setActiveTicker: (ticker) => {
        activeTicker = ticker
      },
      setStatus,
      symbols,
    }),
    dispose: () => {
      disposed = true
      latestRequestIdsByTicker.clear()
    },
  }
}

function createBasicDatafeed(params: GetBarsHandlerParams): IBasicDataFeed {
  return {
    getBars: createGetBarsHandler(params),
    onReady: (onReadyCallback: OnReadyCallback) => {
      setTimeout(() => {
        onReadyCallback({
          exchanges: [
            {
              desc: PRO_CHART_EXCHANGE_NAME,
              name: PRO_CHART_EXCHANGE_NAME,
              value: PRO_CHART_EXCHANGE_VALUE,
            },
          ],
          supported_resolutions: PRO_CHART_SUPPORTED_RESOLUTIONS,
          supports_time: false,
        })
      }, 0)
    },
    resolveSymbol: (symbolName, onResolve, onError) => {
      const symbol = findChartSymbol(params.symbols, symbolName)

      setTimeout(() => {
        if (!symbol) {
          onError(`Cannot resolve symbol: ${symbolName}`)
          return
        }

        params.setActiveTicker(symbol.ticker)
        onResolve({
          ...symbol.librarySymbolInfo,
          pricescale: params.metric === 'marketCap' ? 1 : 1_000_000_000_000,
        })
      }, 0)
    },
    searchSymbols: (_userInput, _exchange, _symbolType, onResult) => onResult([]),
    subscribeBars: () => undefined,
    unsubscribeBars: () => undefined,
  }
}

function createGetBarsHandler(params: GetBarsHandlerParams): IBasicDataFeed['getBars'] {
  return (symbolInfo, resolution, periodParams, onResult, onError) => {
    const resolvedResolution = mapResolutionToPriceChartResolution(resolution)

    if (!resolvedResolution) {
      onResult([], { noData: true })
      return
    }

    const symbol = resolveSymbolFromInfo(params.symbols, symbolInfo)

    if (!symbol) {
      onError(`Unknown symbol: ${symbolInfo.ticker || symbolInfo.name}`)
      return
    }

    if (PRO_CHART_DISABLE_BACKFILL_REQUESTS && !periodParams.firstDataRequest) {
      onResult([], { noData: true })
      return
    }

    params.setActiveTicker(symbol.ticker)
    const requestId = (params.latestRequestIdsByTicker.get(symbol.ticker) || 0) + 1
    params.latestRequestIdsByTicker.set(symbol.ticker, requestId)

    if (requestId === 1) {
      setFirstRequestStatus(periodParams, (status) => params.setStatus(status, symbol.ticker), 'loading')
    }

    void loadHistory({
      isLatestRequest: () => !params.isDisposed() && params.latestRequestIdsByTicker.get(symbol.ticker) === requestId,
      onError,
      onHistoryLoaded: (bars) => params.setHistory(bars, symbol.ticker),
      onResult,
      metric: params.metric,
      periodParams,
      resolution: resolvedResolution,
      setStatus: (status) => params.setStatus(status, symbol.ticker),
      symbol,
    })
  }
}

async function fetchHistory(
  symbol: PriceChartSymbolDescriptor,
  periodParams: PeriodParams,
  resolution: PriceChartResolution,
  metric: PriceChartMetric,
): Promise<PriceChartBar[]> {
  return loadPriceChartHistory(symbol, periodParams.from, periodParams.to, resolution, metric, periodParams.countBack)
}

async function loadHistory(params: HistoryLoaderParams): Promise<void> {
  try {
    const bars = await fetchHistory(params.symbol, params.periodParams, params.resolution, params.metric)

    if (!params.isLatestRequest()) {
      params.onResult(mapPriceChartBarsToTradingViewBars(bars), { noData: !bars.length })
      return
    }

    if (!bars.length) {
      reportEmptyHistory(params)
      return
    }

    reportReadyHistory(params, bars)
  } catch (error) {
    reportHistoryError(params, error)
  }
}

function reportEmptyHistory(params: HistoryLoaderParams): void {
  params.onResult([], { noData: true })
  setFirstRequestStatus(params.periodParams, params.setStatus, 'empty')
}

function reportHistoryError(params: HistoryLoaderParams, error: unknown): void {
  const lastError = error instanceof Error ? error : new Error(String(error))
  params.onError(lastError.message || 'Unknown chart error')

  if (params.isLatestRequest()) {
    setFirstRequestStatus(params.periodParams, params.setStatus, 'error')
  }
}

function reportReadyHistory(params: HistoryLoaderParams, bars: PriceChartBar[]): void {
  params.onHistoryLoaded(bars)
  params.onResult(mapPriceChartBarsToTradingViewBars(bars), { noData: false })
  params.setStatus(null)
}

function resolveSymbolFromInfo(
  symbols: PriceChartSymbolDescriptor[],
  symbolInfo: Pick<LibrarySymbolInfo, 'name' | 'ticker' | 'full_name'>,
): PriceChartSymbolDescriptor | undefined {
  return (
    (symbolInfo.ticker && findChartSymbol(symbols, symbolInfo.ticker)) ||
    findChartSymbol(symbols, symbolInfo.name) ||
    findChartSymbol(symbols, symbolInfo.full_name)
  )
}

function setFirstRequestStatus(
  periodParams: PeriodParams,
  setStatus: (status: PriceChartHistoryStatus) => void,
  status: PriceChartHistoryStatus,
): void {
  if (periodParams.firstDataRequest) {
    setStatus(status)
  }
}
