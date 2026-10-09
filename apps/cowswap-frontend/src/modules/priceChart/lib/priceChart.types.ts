import type { CANDLE_INTERVALS, TIME_RANGES } from '../config/priceChart.constants'

export interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type CandleInterval = (typeof CANDLE_INTERVALS)[number]

export type ChartMetric = 'marketCap' | 'price'

export type ChartMode = 'simple' | 'advanced'

export type ChartPair = 'sell-usd' | 'buy-usd'

export type ChartType = 'candles' | 'line'

export interface ExpansionControl {
  isExpanded: boolean
  onToggle: () => void
}

export type SupplyVariant = 'circulating' | 'total'

export type TimeRange = (typeof TIME_RANGES)[number]
