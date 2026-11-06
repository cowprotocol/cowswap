'use client'

import { useAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './ChartRangeSelector.module.css'

import { chartRangeAtom } from '../model/chartRangeAtom'

import { RWA_CHART_RANGES } from '@/entities/asset'
import { trackEvent } from '@/shared/lib/analytics'

export function ChartRangeSelector(): ReactNode {
  const [range, setRange] = useAtom(chartRangeAtom)

  return (
    <div className={styles.ranges} role="group" aria-label="Chart range">
      {RWA_CHART_RANGES.map((item) => (
        <button
          key={item}
          type="button"
          className={item === range ? styles.activeRange : undefined}
          aria-pressed={item === range}
          onClick={() => {
            setRange(item)
            trackEvent('chart_range_select', { range: item })
          }}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
