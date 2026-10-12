import type { CANDLE_INTERVAL_SECONDS, TIME_RANGES } from '../config/priceChart.constants'

export interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type CandleInterval = keyof typeof CANDLE_INTERVAL_SECONDS

export type ChartMetric = 'marketCap' | 'price'

export type ChartMode = 'simple' | 'advanced'

export type ChartPair = 'sell-usd' | 'buy-usd'

export type ChartType = 'candles' | 'line'

export interface ExpansionControl {
  isExpanded: boolean
  onToggle: () => void
}

export interface PriceChartReferenceLine<TPrice> {
  id: string
  label: string
  price: TPrice
}

export type SupplyVariant = 'circulating' | 'total'

export type TimeRange = (typeof TIME_RANGES)[number]
