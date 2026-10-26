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
 * The CoinGecko `/rwas/markets` 24h change and day range can include bad ticks of one token
 * that the reference token's price chart doesn't have, so they come from its 1D series once loaded
 */
export function useAssetMarket(ticker: string): AssetMarketState {
  const { data, error } = useAtomValue(assetQueryAtomFamily(ticker))
  const { data: dailyChart } = useAtomValue(assetDailyChartQueryAtomFamily(ticker))
  const market = data?.market
  const price = market?.price ?? null
  const dailyStats = useMemo(() => (dailyChart ? getDailyStats(dailyChart.points, price) : null), [dailyChart, price])

  return {
    data,
    error,
    market: market && dailyStats ? { ...market, ...dailyStats } : market,
  }
}
