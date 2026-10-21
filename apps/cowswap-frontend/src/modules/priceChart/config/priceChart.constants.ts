import ms from 'ms.macro'

export const FALLBACK_TOKEN_SYMBOL = 'TOKEN'

export const CANDLE_UP_COLOR = '#089981'
export const CANDLE_DOWN_COLOR = '#F23645'

export const PRICE_CHART_REFRESH_INTERVAL = ms`30s`

export const PRICE_CHART_TIMEOUT = ms`30s`

export const CANDLE_INTERVAL_SECONDS = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '4h': 14400,
  '1d': 86400,
  '7d': 604800,
} as const

export const CANDLE_INTERVALS = Object.keys(CANDLE_INTERVAL_SECONDS) as Array<keyof typeof CANDLE_INTERVAL_SECONDS>

export const TIME_RANGES = ['1H', '1D', '1W', '1M', '1Y', 'All'] as const
