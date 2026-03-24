import { findChartSymbol } from './symbolCatalog'
import {
  PRO_CHART_DISABLE_BACKFILL_REQUESTS,
  PRO_CHART_EXCHANGE_NAME,
  PRO_CHART_EXCHANGE_VALUE,
  PRO_CHART_SUPPORTED_RESOLUTIONS,
} from './tradingView.constants'
import {
  buildPriceChartQueryParams,
  getReadyStatusMessage,
  getResolvedPriceRequests,
  mapPriceChartBarsToTradingViewBars,
  mapResolutionToPriceChartResolution,
} from './tradingViewAdapter.utils'

import { fetchPriceChartData } from '../api'

import type { IBasicDataFeed, LibrarySymbolInfo, OnReadyCallback } from './charting_library'
import type {
  CreatePriceChartDatafeedParams,
  PriceChartDatafeedController,
  PriceChartHistoryStatus,
  PriceChartSymbolDescriptor,
} from './tradingView.types'

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

function getLoadingStatus(symbol: PriceChartSymbolDescriptor): PriceChartHistoryStatus {
  return {
    kind: 'loading',
    message: `Loading ${symbol.ticker} history from Codex.`,
    ticker: symbol.ticker,
  }
}

function getEmptyStatus(symbol: PriceChartSymbolDescriptor): PriceChartHistoryStatus {
  return {
    kind: 'empty',
    message: `No chart history available for ${symbol.ticker}.`,
    ticker: symbol.ticker,
  }
}

function getErrorStatus(symbol: PriceChartSymbolDescriptor, reason: string): PriceChartHistoryStatus {
  return {
    kind: 'error',
    message: `Failed to load ${symbol.ticker} history from Codex. ${reason}`,
    ticker: symbol.ticker,
  }
}

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

  const datafeed: IBasicDataFeed = {
    getBars: (symbolInfo, resolution, periodParams, onResult, onError) => {
      const resolvedResolution = mapResolutionToPriceChartResolution(resolution)

      if (!resolvedResolution) {
        onResult([], { noData: true })
        return
      }

      const symbol = resolveSymbolFromInfo(symbols, symbolInfo)

      if (!symbol) {
        onError(`Unknown symbol: ${symbolInfo.ticker || symbolInfo.name}`)
        return
      }

      if (PRO_CHART_DISABLE_BACKFILL_REQUESTS && !periodParams.firstDataRequest) {
        onResult([], { noData: true })
        return
      }

      const requestId = (latestRequestIdsByTicker.get(symbol.ticker) || 0) + 1
      latestRequestIdsByTicker.set(symbol.ticker, requestId)
      if (periodParams.firstDataRequest) {
        setStatus(getLoadingStatus(symbol))
      }

      const isLatestRequest = (): boolean => !disposed && latestRequestIdsByTicker.get(symbol.ticker) === requestId

      void (async () => {
        let lastError: Error | null = null

        for (const request of getResolvedPriceRequests(symbol)) {
          try {
            const bars = await fetchPriceChartData(
              buildPriceChartQueryParams(
                symbol,
                request,
                periodParams.from,
                periodParams.to,
                resolvedResolution,
                periodParams.countBack,
              ),
            )

            if (!isLatestRequest()) {
              return
            }

            if (!bars.length) {
              continue
            }

            onResult(mapPriceChartBarsToTradingViewBars(bars), { noData: false })
            setStatus({
              kind: 'ready',
              message: getReadyStatusMessage(symbol, request),
              ticker: symbol.ticker,
            })
            return
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))
          }
        }

        if (!isLatestRequest()) {
          return
        }

        if (!lastError) {
          onResult([], { noData: true })
          if (periodParams.firstDataRequest) {
            setStatus(getEmptyStatus(symbol))
          }
          return
        }

        const message = lastError.message || 'Unknown chart error'
        onError(message)
        if (periodParams.firstDataRequest) {
          setStatus(getErrorStatus(symbol, message))
        }
      })()
    },
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
          supports_time: true,
        })
      }, 0)
    },
    resolveSymbol: (symbolName, onResolve, onError) => {
      const symbol = findChartSymbol(symbols, symbolName)

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

  return {
    datafeed,
    dispose: () => {
      disposed = true
      latestRequestIdsByTicker.clear()
    },
  }
}
