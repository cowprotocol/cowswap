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
    message: `Loading ${symbol.ticker} history.`,
    ticker: symbol.ticker,
  }
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
        const requests = getResolvedPriceRequests(symbol)

        if (!requests.length) {
          onResult([], { noData: true })
          if (periodParams.firstDataRequest) {
            setStatus(getEmptyStatus(symbol))
          }
          return
        }

        try {
          const responses = await Promise.all(
            requests.map((request) =>
              fetchPriceChartData(
                buildPriceChartQueryParams(
                  symbol,
                  request,
                  periodParams.from,
                  periodParams.to,
                  resolvedResolution,
                  periodParams.countBack,
                ),
              ),
            ),
          )

          if (!isLatestRequest()) {
            return
          }

          const bars =
            symbol.quoteAsset.kind === 'token'
              ? derivePairBarsFromUsdBars(responses[0] || [], responses[1] || [])
              : responses[0] || []

          if (!bars.length) {
            onResult([], { noData: true })
            if (periodParams.firstDataRequest) {
              setStatus(getEmptyStatus(symbol))
            }
            return
          }

          onResult(mapPriceChartBarsToTradingViewBars(bars), { noData: false })
          setStatus({
            kind: 'ready',
            latestPrice: bars[bars.length - 1]?.close,
            message: getReadyStatusMessage(symbol, requests[0]),
            ticker: symbol.ticker,
          })
          return
        } catch (error) {
          const lastError = error instanceof Error ? error : new Error(String(error))

          if (!isLatestRequest()) {
            return
          }

          const message = lastError.message || 'Unknown chart error'
          onError(message)
          if (periodParams.firstDataRequest) {
            setStatus(getErrorStatus(symbol))
          }
          return
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
