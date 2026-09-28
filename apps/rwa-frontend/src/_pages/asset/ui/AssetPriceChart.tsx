'use client'

import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetPriceChart.module.css'
import { ChartRangeSelector } from './ChartRangeSelector'

import { chartRangeAtom } from '../model/chartRangeAtom'

import { PriceChart, useAssetChart } from '@/entities/asset'

export function AssetPriceChart({ ticker }: { ticker: string }): ReactNode {
  const range = useAtomValue(chartRangeAtom)
  const { data, error } = useAssetChart(ticker, range)

  return (
    <section className={styles.chartCard}>
      <ChartRangeSelector />
      {error && !data ? (
        <p className={styles.status}>Chart is unavailable: {error.message}</p>
      ) : (
        <PriceChart points={data?.points ?? []} showTime={range === '1D' || range === '1W'} />
      )}
    </section>
  )
}
