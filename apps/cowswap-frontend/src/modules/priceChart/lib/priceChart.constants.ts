import ms from 'ms.macro'

export const PRICE_CHART_TIMEOUT = ms`30s`

export const CANDLE_INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d', '7d'] as const
