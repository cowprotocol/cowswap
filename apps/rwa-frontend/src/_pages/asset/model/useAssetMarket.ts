import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { assetDailyChartQueryAtomFamily } from './assetChartQueryAtomFamily'

import { assetQueryAtomFamily, getDailyStats, type RwaAssetResponse, type RwaMarketData } from '@/entities/asset'

interface AssetMarketState {
  data: RwaAssetResponse | undefined
  error: Error | null
  market: RwaMarketData | null | undefined
}

/**
 * The 24h change is the one Explore shows. The CoinGecko `/rwas/markets` day range can include bad ticks of one token,
 * so it comes from the 1D chart once loaded
 */
export function useAssetMarket(ticker: string): AssetMarketState {
  const { data, error } = useAtomValue(assetQueryAtomFamily(ticker))
  const { data: dailyChart } = useAtomValue(assetDailyChartQueryAtomFamily(ticker))
  const market = data?.market
  const price = market?.price ?? null
  const updatedAt = market?.updatedAt ?? null
  const dailyStats = useMemo(
    () => (dailyChart ? getDailyStats(dailyChart.points, price, updatedAt) : null),
    [dailyChart, price, updatedAt],
  )

  return {
    data,
    error,
    market: market && dailyStats ? { ...market, dayLow: dailyStats.dayLow, dayHigh: dailyStats.dayHigh } : market,
  }
}
