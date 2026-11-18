'use client'

import { useAtomValue } from 'jotai'
import { type ReactNode, useMemo } from 'react'

import styles from './AssetPriceChart.module.css'
import { ChartRangeSelector } from './ChartRangeSelector'
import { ChartTypeSelector } from './ChartTypeSelector'

import { assetCandlesQueryAtomFamily, assetChartQueryAtomFamily } from '../model/assetChartQueryAtomFamily'
import { chartRangeAtom } from '../model/chartRangeAtom'
import { chartTypeAtom } from '../model/chartTypeAtom'
import { shownMarketKindAtomFamily } from '../model/marketKindAtom'
import { useAssetPriceStats } from '../model/useAssetPriceStats'
import { usePrefetchOtherChartType } from '../model/usePrefetchOtherChartType'

import { assetStockQueryAtomFamily, pointsToCandles, PriceChart, withLatestPrice } from '@/entities/asset'

export function AssetPriceChart({ ticker }: { ticker: string }): ReactNode {
  const range = useAtomValue(chartRangeAtom)
  const chartType = useAtomValue(chartTypeAtom)
  const lineQuery = useAtomValue(assetChartQueryAtomFamily(ticker))
  const candlesQuery = useAtomValue(assetCandlesQueryAtomFamily(ticker))
  const marketKind = useAtomValue(shownMarketKindAtomFamily(ticker))
  // Until the stock market loads, an asset without stock data would flash an empty stock chart
  const isStockPending = useAtomValue(assetStockQueryAtomFamily(ticker)).isPending && marketKind === 'stock'

  const { stats } = useAssetPriceStats(ticker)
  const price = stats?.price ?? null
  const updatedAt = stats?.updatedAt ?? null

  usePrefetchOtherChartType(ticker)
  const { data, error, isPlaceholderData } = chartType === 'line' ? lineQuery : candlesQuery
  const lineData = lineQuery.data
  const candleData = candlesQuery.data
  const candles = useMemo(
    () =>
      withLatestPrice(
        chartType === 'line' ? pointsToCandles(lineData?.points ?? []) : (candleData?.candles ?? []),
        price,
        updatedAt,
      ),
    [chartType, lineData, candleData, price, updatedAt],
  )

  return (
    <section className={styles.chartCard}>
      <div className={styles.controls}>
        <ChartRangeSelector />
        <ChartTypeSelector />
      </div>
      {error && !data ? (
        <p className={styles.status}>Chart is unavailable: {error.message}</p>
      ) : (
        <PriceChart
          ticker={ticker}
          candles={candles}
          chartType={chartType}
          range={range}
          loading={!data || isStockPending}
          stale={isPlaceholderData}
        />
      )}
    </section>
  )
}
