import { type ReactNode, useId } from 'react'

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
  /** Shown instead of a series with less than two points */
  placeholder?: ReactNode
  className?: string
}

export function Sparkline({ series, tone, area = false, placeholder = null, className }: SparklineProps): ReactNode {
  const gradientId = useId()
  const points = series ? toSparklinePoints(series, VIEWBOX_WIDTH, VIEWBOX_HEIGHT) : null

  if (!points) return placeholder

  return (
    <svg
      className={[styles.sparkline, styles[tone], className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {area && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            fill={`url(#${gradientId})`}
            points={`0,${VIEWBOX_HEIGHT} ${points} ${VIEWBOX_WIDTH},${VIEWBOX_HEIGHT}`}
          />
        </>
      )}
      <polyline className={styles.sparklineLine} points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
