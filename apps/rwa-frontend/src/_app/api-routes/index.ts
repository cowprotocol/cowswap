import { getAssetHandler as getAsset } from './asset'
import { getAssetsHandler as getAssets } from './assets'
import { searchAssetsHandler as searchAssets } from './assetsSearch'
import { getChartHandler as getChart } from './chart'
import { getMarketOverviewHandler as getMarketOverview } from './marketOverview'
import { getNetworkStatsHandler as getNetworkStats } from './networkStats'
import { getQuotesHandler as getQuotes } from './quotes'

import { withRequestLogging } from '@/shared/lib/http'

export { getTokenListHandler } from './tokenList'

export const getAssetHandler = withRequestLogging('/api/v1/asset/[ticker]', getAsset)
export const getAssetsHandler = withRequestLogging('/api/v1/assets', getAssets)
export const searchAssetsHandler = withRequestLogging('/api/v1/assets-search', searchAssets)
export const getChartHandler = withRequestLogging('/api/v1/chart/[ticker]', getChart)
export const getMarketOverviewHandler = withRequestLogging('/api/v1/market-overview', getMarketOverview)
export const getNetworkStatsHandler = withRequestLogging('/api/v1/network-stats/[ticker]', getNetworkStats)
export const getQuotesHandler = withRequestLogging('/api/v1/quotes/[ticker]', getQuotes)
