import type { QueryClient } from '@tanstack/react-query'

import { normalizeError } from '@cowprotocol/common-utils'

import { toMarketCapBars } from './loadPriceChartHistory'
import { PRICE_CHART_REFRESH_INTERVAL } from './priceChart.constants'
import { logPriceChart } from './priceChart.utils'
import { priceHistoryQueryOptions } from './priceHistoryQuery.utils'
import { findChartSymbol } from './symbolCatalog'
import { mapCandlesToTradingViewBars, mapResolutionToCandleInterval } from './tradingViewAdapter.utils'

import type { IBasicDataFeed } from './loadChartingLibrary'
import type { Candle, CandleInterval } from './priceChart.types'
import type { PriceChartSymbolDescriptor } from './tradingView.types'

const INTERVAL_SECONDS: Record<CandleInterval, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '4h': 14400,
  '1d': 86400,
  '7d': 604800,
}

interface PriceChartSubscriptionParams {
  queryClient: QueryClient
  symbols: PriceChartSymbolDescriptor[]
  getLastTimestamp: (ticker: string, interval: CandleInterval) => number | undefined
  onUpdate: (bars: Candle[], ticker: string, interval: CandleInterval) => void
}

export function createPriceChartSubscriptions({
  queryClient,
  symbols,
  getLastTimestamp,
  onUpdate,
}: PriceChartSubscriptionParams): Pick<IBasicDataFeed, 'subscribeBars' | 'unsubscribeBars'> & {
  dispose: () => void
  setAutoRefreshEnabled: (enabled: boolean) => void
} {
  let disposed = false
  let autoRefreshEnabled = true
  const subscriptions = new Map<string, () => void>()
  const unsubscribeBars = (subscriberUID: string): void => {
    subscriptions.get(subscriberUID)?.()
    subscriptions.delete(subscriberUID)
  }

  return {
    subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID) => {
      if (disposed) return
      unsubscribeBars(subscriberUID)
      const symbol = findChartSymbol(symbols, symbolInfo.ticker || symbolInfo.name)
      const interval = mapResolutionToCandleInterval(resolution)
      if (!symbol || !interval) return

      let active = true
      let fetching = false
      let lastTimestamp = getLastTimestamp(symbol.ticker, interval)
      // eslint-disable-next-line complexity
      const poll = async (): Promise<void> => {
        if (!active || !autoRefreshEnabled || fetching) return
        fetching = true
        try {
          const to = Math.floor(Date.now() / PRICE_CHART_REFRESH_INTERVAL) * (PRICE_CHART_REFRESH_INTERVAL / 1000)
          const from = lastTimestamp ?? to - 2 * INTERVAL_SECONDS[interval]
          if (from >= to) return
          const prices = await queryClient.fetchQuery(priceHistoryQueryOptions(symbol.currency, from, to, interval))
          const bars =
            symbol.metric === 'price' ? prices : await toMarketCapBars(symbol.currency, prices, symbol.supplyVariant)
          if (!active || !autoRefreshEnabled) return
          const updates = bars.filter((bar) => lastTimestamp === undefined || bar.timestamp >= lastTimestamp)
          for (const bar of mapCandlesToTradingViewBars(updates)) {
            onRealtimeCallback(bar)
          }
          if (updates.length) {
            lastTimestamp = updates[updates.length - 1].timestamp
            onUpdate(updates, symbol.ticker, interval)
          }
        } catch (err: unknown) {
          if (active) logPriceChart.warn('Failed to refresh Advanced chart', normalizeError(err))
        } finally {
          fetching = false
        }
      }
      const timer = setInterval(() => void poll(), PRICE_CHART_REFRESH_INTERVAL)
      subscriptions.set(subscriberUID, () => {
        active = false
        clearInterval(timer)
      })
    },
    unsubscribeBars,
    setAutoRefreshEnabled: (enabled) => {
      autoRefreshEnabled = enabled
    },
    dispose: () => {
      disposed = true
      for (const unsubscribe of subscriptions.values()) unsubscribe()
      subscriptions.clear()
    },
  }
}
