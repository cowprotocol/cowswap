'use client'

import { useAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './ChartRangeSelector.module.css'

import { chartTypeAtom } from '../model/chartTypeAtom'

import { RWA_CHART_TYPES, type RwaChartType } from '@/entities/asset'

const CHART_TYPE_LABELS: Record<RwaChartType, string> = { line: 'Line chart', candles: 'Candlestick chart' }

export function ChartTypeSelector(): ReactNode {
  const [chartType, setChartType] = useAtom(chartTypeAtom)

  return (
    <div className={styles.ranges} role="group" aria-label="Chart type">
      {RWA_CHART_TYPES.map((item) => (
        <button
          key={item}
          type="button"
          className={item === chartType ? styles.activeRange : undefined}
          aria-pressed={item === chartType}
          aria-label={CHART_TYPE_LABELS[item]}
          title={CHART_TYPE_LABELS[item]}
          onClick={() => setChartType(item)}
        >
          {item === 'line' ? <LineIcon /> : <CandlesIcon />}
        </button>
      ))}
    </div>
  )
}

function CandlesIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 2v12M11 2v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="4.5" width="4" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="6" width="4" height="5" rx="1" fill="currentColor" />
    </svg>
  )
}

function LineIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 11.5 6 7.5l3 2.5 5-5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
