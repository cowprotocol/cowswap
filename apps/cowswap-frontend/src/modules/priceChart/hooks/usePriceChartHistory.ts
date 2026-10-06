import { keepPreviousData, skipToken, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'

import { getChartAssetKey } from '../lib/chartAssets.utils'
import { loadPriceChartHistory, toMarketCapBars } from '../lib/loadPriceChartHistory'
import { getTimeRangeConfig } from '../simple/simplePriceChart.utils'

import type { Candle, ChartAsset, ChartMetric, SupplyVariant } from '../lib/chart.types'
import type { TimeRange } from '../simple/simplePriceChart.utils'

export function usePriceChartHistory(
  asset: ChartAsset | undefined,
  period: TimeRange,
  metric: ChartMetric,
  supplyVariant: SupplyVariant,
): UseQueryResult<Candle[]> {
  const queryClient = useQueryClient()
  const assetKey = asset ? getChartAssetKey(asset) : undefined
  return useQuery({
    queryKey: ['priceChart', 'history', assetKey, period, metric, metric === 'marketCap' ? supplyVariant : null],
    queryFn: asset
      ? async () => {
          const bars = await queryClient.fetchQuery({
            queryKey: ['priceChart', 'prices', assetKey, period],
            queryFn: () => {
              const { from, interval, to } = getTimeRangeConfig(period, Date.now() / 1000)
              return loadPriceChartHistory(asset, from, to, interval, 'price', supplyVariant)
            },
            retry: false,
          })

          return metric === 'price' ? bars : toMarketCapBars(asset, bars, supplyVariant)
        }
      : skipToken,
    placeholderData: keepPreviousData,
    retry: false,
  })
}
