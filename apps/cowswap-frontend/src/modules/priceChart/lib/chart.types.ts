import type { CANDLE_INTERVALS } from './priceChart.constants'

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

export type ChartPair = 'sell-usd' | 'buy-usd'

export interface ExpansionControl {
  isExpanded: boolean
  onToggle: () => void
}

export type SupplyVariant = 'circulating' | 'total'
