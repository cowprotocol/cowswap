'use client'

import { type ReactNode, useEffect, useRef } from 'react'

import { AreaSeries, createChart, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts'

import styles from './PriceChart.module.css'

import type { RwaChartPoint } from '../model/types'

import { useIsDarkTheme } from '@/shared/lib/theme'

const CHART_HEIGHT = 300

interface PriceChartProps {
  points: RwaChartPoint[]
  showTime: boolean
}

export function PriceChart({ points, showTime }: PriceChartProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const isDark = useIsDarkTheme()

  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    const chart = createChart(container, {
      autoSize: true,
      height: CHART_HEIGHT,
      layout: {
        background: { color: 'transparent' },
        fontFamily: readCssVar(container, '--font-family'),
        fontSize: 11,
        attributionLogo: false,
      },
      grid: { vertLines: { visible: false } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      handleScale: false,
      handleScroll: { mouseWheel: false },
    })

    chartRef.current = chart
    seriesRef.current = chart.addSeries(AreaSeries, { lineWidth: 2 })

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    const accent = readCssVar(container, '--color-accent')

    chartRef.current?.applyOptions({
      layout: { textColor: readCssVar(container, '--color-text-secondary') },
      grid: { horzLines: { color: readCssVar(container, '--color-border') } },
    })
    seriesRef.current?.applyOptions({ lineColor: accent, topColor: `${accent}55`, bottomColor: `${accent}00` })
  }, [isDark])

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
