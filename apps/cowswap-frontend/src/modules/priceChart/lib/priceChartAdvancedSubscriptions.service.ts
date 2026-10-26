import type { QueryClient } from '@tanstack/react-query'

import { normalizeError } from '@cowprotocol/common-utils'

import { toMarketCapBars } from './loadPriceChartHistory'
import { logPriceChart } from './priceChart.utils'
import { mapCandlesToTradingViewBars, mapResolutionToCandleInterval } from './priceChartAdvancedBars.utils'
import { findChartSymbol } from './priceChartAdvancedSymbols.utils'
import { priceHistoryQueryOptions } from './priceHistoryQuery.utils'

import { CANDLE_INTERVAL_SECONDS, PRICE_CHART_REFRESH_INTERVAL } from '../config/priceChart.constants'

import type { Candle, CandleInterval } from './priceChart.types'
import type { ChartSymbol } from './priceChartAdvancedSymbols.utils'
import type { IBasicDataFeed } from 'charting_library'

interface PriceChartPollingParams extends Omit<PriceChartSubscriptionParams, 'symbols'> {
  symbol: ChartSymbol
  interval: CandleInterval
  isAutoRefreshEnabled: () => boolean
  onRealtimeCallback: Parameters<IBasicDataFeed['subscribeBars']>[2]
}

interface PriceChartSubscriptionParams {
  queryClient: QueryClient
  symbols: ChartSymbol[]
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

      subscriptions.set(
        subscriberUID,
        createSubscription({
          queryClient,
          symbol,
          interval,
          getLastTimestamp,
          onUpdate,
          onRealtimeCallback,
          isAutoRefreshEnabled: () => autoRefreshEnabled,
        }),
      )
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

function createSubscription({
  queryClient,
  symbol,
  interval,
  getLastTimestamp,
  onUpdate,
  onRealtimeCallback,
  isAutoRefreshEnabled,
}: PriceChartPollingParams): () => void {
  let active = true
  let fetching = false
  let lastTimestamp = getLastTimestamp(symbol.ticker, interval)

  function publishUpdates(bars: Candle[]): void {
    const updates = bars.filter((bar) => lastTimestamp === undefined || bar.timestamp >= lastTimestamp)
    if (!updates.length) return

    for (const bar of mapCandlesToTradingViewBars(updates)) {
      onRealtimeCallback(bar)
    }
    lastTimestamp = updates[updates.length - 1].timestamp
    onUpdate(updates, symbol.ticker, interval)
  }

  async function poll(): Promise<void> {
    if (!active || !isAutoRefreshEnabled() || fetching) return
    fetching = true
    try {
      const to = Math.floor(Date.now() / PRICE_CHART_REFRESH_INTERVAL) * (PRICE_CHART_REFRESH_INTERVAL / 1000)
      const from = lastTimestamp ?? to - 2 * CANDLE_INTERVAL_SECONDS[interval]
      if (from >= to) return

      const bars = await fetchMetricCandles(queryClient, symbol, from, to, interval)
      if (!active || !isAutoRefreshEnabled()) return
      publishUpdates(bars)
    } catch (err: unknown) {
      const error = normalizeError(err)
      if (active) logPriceChart.warn('Failed to refresh Advanced chart', error)
    } finally {
      fetching = false
    }
  }

  const timer = setInterval(poll, PRICE_CHART_REFRESH_INTERVAL)
  return () => {
    active = false
    clearInterval(timer)
  }
}

async function fetchMetricCandles(
  queryClient: QueryClient,
  symbol: ChartSymbol,
  from: number,
  to: number,
  interval: CandleInterval,
): Promise<Candle[]> {
  const prices = await queryClient.fetchQuery(priceHistoryQueryOptions(symbol.currency, from, to, interval))
  return symbol.metric === 'price' ? prices : toMarketCapBars(symbol.currency, prices, symbol.supplyVariant)
}
