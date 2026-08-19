import type { ResolutionString } from './charting_library'

const resolutionString = (value: string): ResolutionString => value as ResolutionString

export const PRO_CHART_CONTAINER_ID = 'cow-swap-pro-chart'
export const PRO_CHART_EXCHANGE_NAME = 'CoW Swap'
export const PRO_CHART_EXCHANGE_VALUE = 'cow-swap'
export const PRO_CHART_SYMBOL_TYPE = 'spot crypto'
export const PRO_CHART_LIBRARY_PATH = '/charting_library/'
export const PRO_CHART_CSS_PATH = '/tv.css'
export const PRO_CHART_DEFAULT_INTERVAL = resolutionString('1D')
export const PRO_CHART_DISABLE_BACKFILL_REQUESTS = true
export const PRO_CHART_FAVORITE_INTERVALS = [
  resolutionString('1'),
  resolutionString('15'),
  resolutionString('60'),
  resolutionString('240'),
  resolutionString('1D'),
  resolutionString('1W'),
]
export const PRO_CHART_SUPPORTED_RESOLUTIONS = [
  resolutionString('1'),
  resolutionString('5'),
  resolutionString('15'),
  resolutionString('60'),
  resolutionString('240'),
  resolutionString('1D'),
  resolutionString('1W'),
]
export const PRO_CHART_TIME_FRAMES = [
  {
    description: '1 day in 1 minute intervals',
    resolution: resolutionString('1'),
    text: '1D',
  },
  {
    description: '1 week in 15 minute intervals',
    resolution: resolutionString('15'),
    text: '1W',
  },
  {
    description: '1 month in 1 hour intervals',
    resolution: resolutionString('60'),
    text: '1M',
  },
  {
    description: '3 months in 4 hour intervals',
    resolution: resolutionString('240'),
    text: '3M',
  },
  {
    description: '1 year in 1 day intervals',
    resolution: resolutionString('1D'),
    text: '1Y',
  },
]
export const PRO_CHART_USD_ASSET = {
  kind: 'usd',
  key: 'usd',
  name: 'US Dollar',
  symbol: 'USD',
} as const
