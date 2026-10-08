import type { QueryClient } from '@tanstack/react-query'

import { normalizeError } from '@cowprotocol/common-utils'

import { toMarketCapBars } from './loadPriceChartHistory'
import { priceHistoryQueryOptions } from './priceHistoryQuery.utils'
import { findChartSymbol } from './symbolCatalog'
import {
  PRO_CHART_DISABLE_BACKFILL_REQUESTS,
  PRO_CHART_EXCHANGE_NAME,
  PRO_CHART_EXCHANGE_VALUE,
  PRO_CHART_SUPPORTED_RESOLUTIONS,
} from './tradingView.constants'
import { mapCandlesToTradingViewBars, mapResolutionToCandleInterval } from './tradingViewAdapter.utils'

import type { IBasicDataFeed, LibrarySymbolInfo, OnReadyCallback } from './loadChartingLibrary'
import type { Candle, CandleInterval } from './priceChart.types'
import type {
  CreatePriceChartDatafeedParams,
  PriceChartDatafeedController,
  PriceChartSymbolDescriptor,
} from './tradingView.types'

type ErrorCallback = GetBarsParameters[4]

interface GetBarsHandlerParams {
  queryClient: QueryClient
  latestRequestIdsByTicker: Map<string, number>
  setHistory: (bars: Candle[], ticker: string, requestId: number) => void
  setActiveTicker: (ticker: string) => void
  symbols: PriceChartSymbolDescriptor[]
}

type GetBarsParameters = Parameters<IBasicDataFeed['getBars']>
type HistoryCallback = GetBarsParameters[3]

interface HistoryLoaderParams {
  queryClient: QueryClient
  onError: ErrorCallback
  onHistoryLoaded: (bars: Candle[]) => void
  onResult: HistoryCallback
  periodParams: PeriodParams
  resolution: CandleInterval
  symbol: PriceChartSymbolDescriptor
}

type PeriodParams = GetBarsParameters[2]

export function createPriceChartDatafeed({
  queryClient,
  onHistoryLoaded,
  symbols,
}: CreatePriceChartDatafeedParams): PriceChartDatafeedController {
  let disposed = false
  let activeTicker: string | undefined
  const historiesByTicker = new Map<string, { bars: Candle[]; requestId: number }>()
  const latestRequestIdsByTicker = new Map<string, number>()

  const setHistory = (bars: Candle[], ticker: string, requestId: number): void => {
    if (disposed || requestId <= (historiesByTicker.get(ticker)?.requestId ?? 0)) return

    historiesByTicker.set(ticker, { bars, requestId })

    if (ticker === activeTicker) onHistoryLoaded?.(bars)
  }

  const setActiveTicker = (ticker: string): void => {
    if (disposed || ticker === activeTicker) return

    activeTicker = ticker
    const history = historiesByTicker.get(ticker)

    if (history) onHistoryLoaded?.(history.bars)
  }

  return {
    datafeed: createBasicDatafeed({
      queryClient,
      latestRequestIdsByTicker,
      setHistory,
      setActiveTicker,
      symbols,
    }),
    dispose: () => {
      disposed = true
      historiesByTicker.clear()
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
    const resolvedResolution = mapResolutionToCandleInterval(resolution)

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

    void loadHistory({
      queryClient: params.queryClient,
      onError,
      onHistoryLoaded: (bars) => params.setHistory(bars, symbol.ticker, requestId),
      onResult,
      periodParams,
      resolution: resolvedResolution,
      symbol,
    })
  }
}

async function fetchHistory(
  queryClient: QueryClient,
  symbol: PriceChartSymbolDescriptor,
  periodParams: PeriodParams,
  resolution: CandleInterval,
): Promise<Candle[]> {
  // TradingView can end daily/weekly ranges in the future, which the history provider rejects.
  const to = Math.min(periodParams.to, Math.floor(Date.now() / 1000))
  if (periodParams.from >= to) return []

  const bars = await queryClient.fetchQuery(
    priceHistoryQueryOptions(symbol.currency, periodParams.from, periodParams.to, resolution),
  )
  return symbol.metric === 'price' ? bars : toMarketCapBars(symbol.currency, bars, symbol.supplyVariant)
}

async function loadHistory(params: HistoryLoaderParams): Promise<void> {
  try {
    const bars = await fetchHistory(params.queryClient, params.symbol, params.periodParams, params.resolution)

    if (bars.length) params.onHistoryLoaded(bars)

    params.onResult(mapCandlesToTradingViewBars(bars), { noData: !bars.length })
  } catch (error) {
    const normalizedError = normalizeError(error)
    params.onError(normalizedError.message || 'Unknown chart error')
  }
}

function resolveSymbolFromInfo(
  symbols: PriceChartSymbolDescriptor[],
  symbolInfo: Pick<LibrarySymbolInfo, 'name' | 'ticker'>,
): PriceChartSymbolDescriptor | undefined {
  return (symbolInfo.ticker && findChartSymbol(symbols, symbolInfo.ticker)) || findChartSymbol(symbols, symbolInfo.name)
}
