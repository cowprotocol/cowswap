import ms from 'ms.macro'

export const FALLBACK_TOKEN_SYMBOL = 'TOKEN'

export const PRICE_CHART_TIMEOUT = ms`30s`

export const CANDLE_INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d', '7d'] as const

export const TIME_RANGES = ['1H', '1D', '1W', '1M', '1Y', 'All'] as const
