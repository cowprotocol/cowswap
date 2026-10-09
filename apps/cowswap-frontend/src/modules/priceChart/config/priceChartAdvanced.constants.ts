import { TRADING_VIEW_LIBRARY_PATH } from '../lib/priceChartAdvancedWidget.service'

import type { ResolutionString } from '../lib/priceChartAdvancedApi.types'

const resolutionString = (value: string): ResolutionString => value as ResolutionString

export const ADVANCED_CHART_CONTAINER_ID = 'cow-swap-advanced-chart'
export const ADVANCED_CHART_EXCHANGE_NAME = 'CoW Swap'
export const ADVANCED_CHART_EXCHANGE_VALUE = 'cow-swap'
export const ADVANCED_CHART_SYMBOL_TYPE = 'spot crypto'
export const ADVANCED_CHART_LIBRARY_PATH = TRADING_VIEW_LIBRARY_PATH
export const ADVANCED_CHART_CSS_PATH = '/tv.css'
export const ADVANCED_CHART_DEFAULT_INTERVAL = resolutionString('1D')
export const ADVANCED_CHART_DISABLE_BACKFILL_REQUESTS = true
export const ADVANCED_CHART_FAVORITE_INTERVALS = [
  resolutionString('1'),
  resolutionString('5'),
  resolutionString('15'),
  resolutionString('60'),
  resolutionString('240'),
  resolutionString('1D'),
  resolutionString('1W'),
]
export const ADVANCED_CHART_SUPPORTED_RESOLUTIONS = [
  resolutionString('1'),
  resolutionString('5'),
  resolutionString('15'),
  resolutionString('60'),
  resolutionString('240'),
  resolutionString('1D'),
  resolutionString('1W'),
]
export const ADVANCED_CHART_TIME_FRAMES = [
  { description: '1 hour in 1 minute intervals', resolution: resolutionString('1'), text: '1h' },
  { description: '1 day in 5 minute intervals', resolution: resolutionString('5'), text: '1d' },
  { description: '1 week in 15 minute intervals', resolution: resolutionString('15'), text: '7d', title: '1w' },
  { description: '1 month in 1 hour intervals', resolution: resolutionString('60'), text: '1m' },
  { description: '1 year in 1 day intervals', resolution: resolutionString('1D'), text: '1y' },
  { description: 'All history', resolution: resolutionString('1W'), text: '1000y', title: 'All' },
]
