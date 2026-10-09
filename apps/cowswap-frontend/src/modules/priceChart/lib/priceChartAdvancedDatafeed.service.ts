import type { QueryClient } from '@tanstack/react-query'

import { normalizeError } from '@cowprotocol/common-utils'

import { toMarketCapBars } from './loadPriceChartHistory'
import { mapCandlesToTradingViewBars, mapResolutionToCandleInterval } from './priceChartAdvancedBars.utils'
import { createPriceChartSubscriptions } from './priceChartAdvancedSubscriptions.service'
import { findChartSymbol } from './priceChartAdvancedSymbols.utils'
import { priceHistoryQueryOptions } from './priceHistoryQuery.utils'

import {
  PRO_CHART_DISABLE_BACKFILL_REQUESTS,
  PRO_CHART_EXCHANGE_NAME,
  PRO_CHART_EXCHANGE_VALUE,
  PRO_CHART_SUPPORTED_RESOLUTIONS,
} from '../config/priceChartAdvanced.constants'

import type { Candle, CandleInterval } from './priceChart.types'
import type { IBasicDataFeed, LibrarySymbolInfo, OnReadyCallback } from './priceChartAdvancedLibrary.service'
import type { ChartSymbol } from './priceChartAdvancedSymbols.utils'

export interface CreatePriceChartDatafeedParams {
  queryClient: QueryClient
  onHistoryLoaded?: (bars: Candle[]) => void
  symbols: ChartSymbol[]
}

export interface PriceChartDatafeedController {
  datafeed: IBasicDataFeed
  setAutoRefreshEnabled: (enabled: boolean) => void
  setActiveTicker: (ticker: string) => void
  dispose: () => void
}

type ErrorCallback = GetBarsParameters[4]

interface GetBarsHandlerParams {
  queryClient: QueryClient
  latestRequestIdsByTicker: Map<string, number>
  setHistory: (bars: Candle[], ticker: string, requestId: number, interval: CandleInterval) => void
  setActiveTicker: (ticker: string) => void
  symbols: ChartSymbol[]
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
  symbol: ChartSymbol
}

type PeriodParams = GetBarsParameters[2]

export function createPriceChartDatafeed({
  queryClient,
  onHistoryLoaded,
  symbols,
}: CreatePriceChartDatafeedParams): PriceChartDatafeedController {
  let disposed = false
  let activeTicker: string | undefined
  const historiesByTicker = new Map<string, { bars: Candle[]; requestId: number; interval: CandleInterval }>()
  const latestRequestIdsByTicker = new Map<string, number>()

  const setHistory = (bars: Candle[], ticker: string, requestId: number, interval: CandleInterval): void => {
    if (disposed || requestId <= (historiesByTicker.get(ticker)?.requestId ?? 0)) return

    historiesByTicker.set(ticker, { bars, requestId, interval })

    if (ticker === activeTicker) onHistoryLoaded?.(bars)
  }

  const setActiveTicker = (ticker: string): void => {
    if (disposed) return

    activeTicker = ticker
    const history = historiesByTicker.get(ticker)

    if (history) onHistoryLoaded?.(history.bars)
  }

  const subscriptions = createPriceChartSubscriptions({
    queryClient,
    symbols,
    getLastTimestamp: (ticker, interval) => {
      const history = historiesByTicker.get(ticker)
      return history?.interval === interval ? history.bars.at(-1)?.timestamp : undefined
    },
    onUpdate: (bars, ticker, interval) => {
      const history = historiesByTicker.get(ticker)
      if (disposed || (history && history.interval !== interval)) return
      const merged = new Map((history?.bars ?? []).map((bar) => [bar.timestamp, bar]))
      for (const bar of bars) merged.set(bar.timestamp, bar)
      const requestId = (latestRequestIdsByTicker.get(ticker) || 0) + 1
      latestRequestIdsByTicker.set(ticker, requestId)
      setHistory(
        [...merged.values()].sort((a, b) => a.timestamp - b.timestamp),
        ticker,
        requestId,
        interval,
      )
    },
  })

  return {
    datafeed: {
      ...createBasicDatafeed({
        queryClient,
        latestRequestIdsByTicker,
        setHistory,
        setActiveTicker,
        symbols,
      }),
      subscribeBars: subscriptions.subscribeBars,
      unsubscribeBars: subscriptions.unsubscribeBars,
    },
    setAutoRefreshEnabled: subscriptions.setAutoRefreshEnabled,
    setActiveTicker,
    dispose: () => {
      disposed = true
      subscriptions.dispose()
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
      onHistoryLoaded: (bars) => params.setHistory(bars, symbol.ticker, requestId, resolvedResolution),
      onResult,
      periodParams,
      resolution: resolvedResolution,
      symbol,
    })
  }
}

async function fetchHistory(
  queryClient: QueryClient,
  symbol: ChartSymbol,
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
  symbols: ChartSymbol[],
  symbolInfo: Pick<LibrarySymbolInfo, 'name' | 'ticker'>,
): ChartSymbol | undefined {
  return (symbolInfo.ticker && findChartSymbol(symbols, symbolInfo.ticker)) || findChartSymbol(symbols, symbolInfo.name)
}
