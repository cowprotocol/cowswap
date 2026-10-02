import type { ReactNode } from 'react'

import styles from './MarketOverview.module.css'

import { toSparklinePoints } from '../lib/sparklinePoints'

import type { RwaChartPoint } from '@/entities/asset'

const VIEWBOX_WIDTH = 100
const VIEWBOX_HEIGHT = 32

export type SparklineTone = 'positive' | 'negative' | 'neutral'

interface SparklineProps {
  series: RwaChartPoint[] | null
  tone: SparklineTone
  /** Fills the area under the line */
  area?: boolean
  className?: string
}

export function Sparkline({ series, tone, area = false, className }: SparklineProps): ReactNode {
  const points = series ? toSparklinePoints(series, VIEWBOX_WIDTH, VIEWBOX_HEIGHT) : null

  if (!points) return null

  return (
    <svg
      className={[styles.sparkline, styles[tone], className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {area && (
        <polygon
          className={styles.sparklineArea}
          points={`0,${VIEWBOX_HEIGHT} ${points} ${VIEWBOX_WIDTH},${VIEWBOX_HEIGHT}`}
        />
      )}
      <polyline className={styles.sparklineLine} points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
