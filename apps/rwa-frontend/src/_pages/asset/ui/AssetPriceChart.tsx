'use client'

import { useAtomValue } from 'jotai'
import { type ReactNode, useMemo } from 'react'

import styles from './AssetPriceChart.module.css'
import { ChartRangeSelector } from './ChartRangeSelector'
import { ChartTypeSelector } from './ChartTypeSelector'

import { assetCandlesQueryAtomFamily, assetChartQueryAtomFamily } from '../model/assetChartQueryAtomFamily'
import { chartRangeAtom } from '../model/chartRangeAtom'
import { chartTypeAtom } from '../model/chartTypeAtom'
import { usePrefetchOtherChartType } from '../model/usePrefetchOtherChartType'

import { pointsToCandles, PriceChart } from '@/entities/asset'

export function AssetPriceChart({ ticker }: { ticker: string }): ReactNode {
  const range = useAtomValue(chartRangeAtom)
  const chartType = useAtomValue(chartTypeAtom)
  const lineQuery = useAtomValue(assetChartQueryAtomFamily(ticker))
  const candlesQuery = useAtomValue(assetCandlesQueryAtomFamily(ticker))

  usePrefetchOtherChartType(ticker)
  const { data, error, isPlaceholderData } = chartType === 'line' ? lineQuery : candlesQuery
  const lineData = lineQuery.data
  const candleData = candlesQuery.data
  const candles = useMemo(
    () => (chartType === 'line' ? pointsToCandles(lineData?.points ?? []) : (candleData?.candles ?? [])),
    [chartType, lineData, candleData],
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
          loading={!data}
          stale={isPlaceholderData}
        />
      )}
    </section>
  )
}
