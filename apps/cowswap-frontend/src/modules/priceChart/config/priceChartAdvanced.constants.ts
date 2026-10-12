import { CANDLE_DOWN_COLOR, CANDLE_UP_COLOR } from './priceChart.constants'

import { TRADING_VIEW_LIBRARY_PATH } from '../lib/priceChartAdvancedWidget.service'

import type { ChartingLibraryWidgetOptions, ResolutionString } from 'charting_library'

const resolutionString = (value: string): ResolutionString => value as ResolutionString

export const ADVANCED_CHART_CONTAINER_ID = 'cow-swap-advanced-chart'
export const ADVANCED_CHART_EXCHANGE_NAME = 'CoW Swap'
export const ADVANCED_CHART_EXCHANGE_VALUE = 'cow-swap'
export const ADVANCED_CHART_SYMBOL_TYPE = 'spot crypto'
export const ADVANCED_CHART_DISABLE_BACKFILL_REQUESTS = true
const ADVANCED_CHART_FAVORITE_INTERVALS = [
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
const ADVANCED_CHART_TIME_FRAMES = [
  { description: '1 hour in 1 minute intervals', resolution: resolutionString('1'), text: '1h' },
  { description: '1 day in 5 minute intervals', resolution: resolutionString('5'), text: '1d' },
  { description: '1 week in 15 minute intervals', resolution: resolutionString('15'), text: '7d', title: '1w' },
  { description: '1 month in 1 hour intervals', resolution: resolutionString('60'), text: '1m' },
  { description: '1 year in 1 day intervals', resolution: resolutionString('1D'), text: '1y' },
  { description: 'All history', resolution: resolutionString('1W'), text: '1000y', title: 'All' },
]

export const ADVANCED_CHART_OPTIONS = {
  autosize: true,
  auto_save_delay: 5,
  disabled_features: [
    'create_volume_indicator_by_default',
    'display_market_status',
    'header_compare',
    'header_symbol_search',
    'show_symbol_logo_in_legend',
    'symbol_search_hot_key',
  ],
  enabled_features: [
    'hide_resolution_in_legend',
    'iframe_loading_compatibility_mode',
    'timeframes_toolbar',
    'header_in_fullscreen_mode',
    'side_toolbar_in_fullscreen_mode',
  ],
  favorites: {
    chartTypes: ['Candles', 'LineWithMarkers', 'Baseline'],
    intervals: ADVANCED_CHART_FAVORITE_INTERVALS,
  },
  interval: resolutionString('1D'),
  library_path: TRADING_VIEW_LIBRARY_PATH,
  locale: 'en',
  overrides: {
    'mainSeriesProperties.candleStyle.upColor': CANDLE_UP_COLOR,
    'mainSeriesProperties.candleStyle.downColor': CANDLE_DOWN_COLOR,
    'mainSeriesProperties.candleStyle.borderUpColor': CANDLE_UP_COLOR,
    'mainSeriesProperties.candleStyle.borderDownColor': CANDLE_DOWN_COLOR,
    'mainSeriesProperties.candleStyle.wickUpColor': CANDLE_UP_COLOR,
    'mainSeriesProperties.candleStyle.wickDownColor': CANDLE_DOWN_COLOR,
    'mainSeriesProperties.statusViewStyle.symbolTextSource': 'description',
    'mainSeriesProperties.statusViewStyle.showExchange': false,
  },
  time_frames: ADVANCED_CHART_TIME_FRAMES,
  timezone: 'Etc/UTC',
} satisfies Partial<ChartingLibraryWidgetOptions>
