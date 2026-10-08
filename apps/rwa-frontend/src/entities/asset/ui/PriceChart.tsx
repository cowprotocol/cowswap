'use client'

import { type ReactNode, useEffect, useRef } from 'react'

import { AreaSeries, createChart, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts'

import styles from './PriceChart.module.css'

import type { RwaChartPoint } from '../model/types'

const CHART_HEIGHT = 320

interface PriceChartProps {
  points: RwaChartPoint[]
  showTime: boolean
}

export function PriceChart({ points, showTime }: PriceChartProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    const accent = readCssVar(container, '--color-accent')
    const chart = createChart(container, {
      autoSize: true,
      height: CHART_HEIGHT,
      layout: {
        background: { color: 'transparent' },
        textColor: readCssVar(container, '--color-text-secondary'),
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: readCssVar(container, '--color-border') },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    })

    chartRef.current = chart
    seriesRef.current = chart.addSeries(AreaSeries, {
      lineColor: accent,
      topColor: `${accent}55`,
      bottomColor: `${accent}00`,
      lineWidth: 2,
    })

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    chartRef.current?.timeScale().applyOptions({ timeVisible: showTime })
    seriesRef.current?.setData(points.map(({ time, value }) => ({ time: time as UTCTimestamp, value })))
    chartRef.current?.timeScale().fitContent()
  }, [points, showTime])

  return <div ref={containerRef} className={styles.chart} style={{ height: CHART_HEIGHT }} />
}

function readCssVar(element: HTMLElement, name: string): string {
  return getComputedStyle(element).getPropertyValue(name).trim()
}
