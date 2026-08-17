import { findChartSymbol } from './symbolCatalog'
import {
  PRO_CHART_DISABLE_BACKFILL_REQUESTS,
  PRO_CHART_EXCHANGE_NAME,
  PRO_CHART_EXCHANGE_VALUE,
  PRO_CHART_SUPPORTED_RESOLUTIONS,
} from './tradingView.constants'
import {
  buildPriceChartQueryParams,
  derivePairBarsFromUsdBars,
  getReadyStatusMessage,
  getResolvedPriceRequests,
  mapPriceChartBarsToTradingViewBars,
  mapResolutionToPriceChartResolution,
} from './tradingViewAdapter.utils'

import { fetchPriceChartData } from '../api'

import type { IBasicDataFeed, LibrarySymbolInfo, OnReadyCallback } from './charting_library'
import type { PriceChartBar, PriceChartResolution } from './priceChart.types'
import type {
  CreatePriceChartDatafeedParams,
  PriceChartDatafeedController,
  PriceChartHistoryStatus,
  PriceChartResolvedPriceRequest,
  PriceChartSymbolDescriptor,
} from './tradingView.types'

type ErrorCallback = GetBarsParameters[4]

interface GetBarsHandlerParams {
  isDisposed: () => boolean
  latestRequestIdsByTicker: Map<string, number>
  setStatus: (status: PriceChartHistoryStatus) => void
  symbols: PriceChartSymbolDescriptor[]
}

type GetBarsParameters = Parameters<IBasicDataFeed['getBars']>
type HistoryCallback = GetBarsParameters[3]

interface HistoryLoaderParams {
  isLatestRequest: () => boolean
  onError: ErrorCallback
  onResult: HistoryCallback
  periodParams: PeriodParams
  resolution: PriceChartResolution
  setStatus: (status: PriceChartHistoryStatus) => void
  symbol: PriceChartSymbolDescriptor
}

interface LoadedHistory {
  bars: PriceChartBar[]
  request: PriceChartResolvedPriceRequest
}

type PeriodParams = GetBarsParameters[2]

export function createPriceChartDatafeed({
  onStatusChange,
  symbols,
}: CreatePriceChartDatafeedParams): PriceChartDatafeedController {
  let disposed = false
  const latestRequestIdsByTicker = new Map<string, number>()

  const setStatus = (status: PriceChartHistoryStatus): void => {
    if (disposed) return

    onStatusChange(status)
  }

  return {
    datafeed: createBasicDatafeed({
      isDisposed: () => disposed,
      latestRequestIdsByTicker,
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

        onResolve(symbol.librarySymbolInfo)
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

    const requestId = (params.latestRequestIdsByTicker.get(symbol.ticker) || 0) + 1
    params.latestRequestIdsByTicker.set(symbol.ticker, requestId)
    setFirstRequestStatus(periodParams, params.setStatus, getLoadingStatus(symbol))

    void loadHistory({
      isLatestRequest: () => !params.isDisposed() && params.latestRequestIdsByTicker.get(symbol.ticker) === requestId,
      onError,
      onResult,
      periodParams,
      resolution: resolvedResolution,
      setStatus: params.setStatus,
      symbol,
    })
  }
}

async function fetchHistory(
  symbol: PriceChartSymbolDescriptor,
  periodParams: PeriodParams,
  resolution: PriceChartResolution,
): Promise<LoadedHistory | null> {
  const requests = getResolvedPriceRequests(symbol)
  const [firstRequest] = requests

  if (!firstRequest) {
    return null
  }

  const responses = await Promise.all(
    requests.map((request) =>
      fetchPriceChartData(
        buildPriceChartQueryParams(
          symbol,
          request,
          periodParams.from,
          periodParams.to,
          resolution,
          periodParams.countBack,
        ),
      ),
    ),
  )
  const bars =
    symbol.quoteAsset.kind === 'token'
      ? derivePairBarsFromUsdBars(responses[0] || [], responses[1] || [])
      : responses[0] || []

  return { bars, request: firstRequest }
}

function getEmptyStatus(symbol: PriceChartSymbolDescriptor): PriceChartHistoryStatus {
  return {
    kind: 'empty',
    message: `No price history found for ${symbol.ticker}.`,
    ticker: symbol.ticker,
  }
}

function getErrorStatus(symbol: PriceChartSymbolDescriptor): PriceChartHistoryStatus {
  return {
    kind: 'error',
    message: `Failed to load ${symbol.ticker} history.`,
    ticker: symbol.ticker,
  }
}

function getLoadingStatus(symbol: PriceChartSymbolDescriptor): PriceChartHistoryStatus {
  return {
    kind: 'loading',
    message: `Loading ${symbol.ticker} history.`,
    ticker: symbol.ticker,
  }
}

async function loadHistory(params: HistoryLoaderParams): Promise<void> {
  try {
    const history = await fetchHistory(params.symbol, params.periodParams, params.resolution)

    if (!params.isLatestRequest()) {
      return
    }

    if (!history || !history.bars.length) {
      reportEmptyHistory(params)
      return
    }

    reportReadyHistory(params, history)
  } catch (error) {
    reportHistoryError(params, error)
  }
}

function reportEmptyHistory(params: HistoryLoaderParams): void {
  params.onResult([], { noData: true })
  setFirstRequestStatus(params.periodParams, params.setStatus, getEmptyStatus(params.symbol))
}

function reportHistoryError(params: HistoryLoaderParams, error: unknown): void {
  if (!params.isLatestRequest()) {
    return
  }

  const lastError = error instanceof Error ? error : new Error(String(error))
  params.onError(lastError.message || 'Unknown chart error')
  setFirstRequestStatus(params.periodParams, params.setStatus, getErrorStatus(params.symbol))
}

function reportReadyHistory(params: HistoryLoaderParams, history: LoadedHistory): void {
  params.onResult(mapPriceChartBarsToTradingViewBars(history.bars), { noData: false })
  params.setStatus({
    kind: 'ready',
    latestPrice: history.bars[history.bars.length - 1]?.close,
    message: getReadyStatusMessage(params.symbol, history.request),
    ticker: params.symbol.ticker,
  })
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
