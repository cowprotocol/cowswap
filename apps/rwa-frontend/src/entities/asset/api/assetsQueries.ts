import { keepPreviousData } from '@tanstack/query-core'

import { atomFamily } from 'jotai-family'
import { type AtomWithQueryOptions, atomWithQuery } from 'jotai-tanstack-query'

import {
  type AssetsPageQuery,
  getAssetsSearchUrl,
  getAssetsUrl,
  getAssetUrl,
  getChartUrl,
  getMarketOverviewUrl,
  getNetworkStatsUrl,
  getNewsUrl,
  getQuotesUrl,
  getTokenListUrl,
} from './assetsApi'

import type {
  RwaAssetQuotes,
  RwaAssetNews,
  RwaAssetResponse,
  RwaAssetsByTickers,
  RwaAssetsPage,
  RwaAssetsSearchResult,
  RwaChart,
  RwaChartRange,
  RwaMarketOverview,
  RwaNetworkStats,
  RwaQuoteSide,
  RwaTokenList,
} from '../model/types'

import { RWA_QUERY_KEY_ROOT, rwaFetcher } from '@/shared/api'

type RwaQueryOptions<T> = AtomWithQueryOptions<T, Error>

const MARKET_REFRESH_INTERVAL_MS = 60_000
/** `/api/v1/assets` accepts up to 100 `tickers` and returns up to 100 items */
const MAX_ASSETS_PAGE_TICKERS = 100
/** Same as the `/api/v1/token-list` cache max-age */
const TOKEN_LIST_STALE_TIME_MS = 60 * 60 * 1000
/** Same as the `/api/v1/news` cache max-age */
const NEWS_STALE_TIME_MS = 15 * 60 * 1000

export function assetChartQueryOptions(ticker: string, range: RwaChartRange): RwaQueryOptions<RwaChart> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'chart', ticker, range],
    queryFn: () => rwaFetcher<RwaChart>(getChartUrl(ticker, range)),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  }
}

/** `/api/v1/network-stats` caches stats for the same interval */
export function assetNetworkStatsQueryOptions(ticker: string, chainId: number): RwaQueryOptions<RwaNetworkStats> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'network-stats', ticker, chainId],
    queryFn: () => rwaFetcher<RwaNetworkStats>(getNetworkStatsUrl(ticker, chainId)),
    placeholderData: keepPreviousData,
    refetchInterval: MARKET_REFRESH_INTERVAL_MS,
  }
}

export function assetNewsQueryOptions(ticker: string): RwaQueryOptions<RwaAssetNews> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'news', ticker],
    queryFn: () => rwaFetcher<RwaAssetNews>(getNewsUrl(ticker)),
    staleTime: NEWS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  }
}

export function assetQueryOptions(ticker: string): RwaQueryOptions<RwaAssetResponse> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'asset', ticker],
    queryFn: () => rwaFetcher<RwaAssetResponse>(getAssetUrl(ticker)),
    refetchInterval: MARKET_REFRESH_INTERVAL_MS,
  }
}

/** `/api/v1/quotes` caches quotes for the same interval */
export function assetQuotesQueryOptions(
  ticker: string,
  chainId: number,
  side: RwaQuoteSide,
): RwaQueryOptions<RwaAssetQuotes> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'quotes', ticker, chainId, side],
    queryFn: () => rwaFetcher<RwaAssetQuotes>(getQuotesUrl(ticker, chainId, side)),
    placeholderData: keepPreviousData,
    refetchInterval: MARKET_REFRESH_INTERVAL_MS,
  }
}

export function assetsByTickersQueryOptions(tickers: string[]): RwaQueryOptions<RwaAssetsByTickers> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'assets-by-tickers', tickers],
    queryFn: () => fetchAssetsByTickers(tickers),
    placeholderData: keepPreviousData,
    enabled: tickers.length > 0,
  }
}

export function assetsPageQueryOptions(query: AssetsPageQuery): RwaQueryOptions<RwaAssetsPage> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'assets', query],
    queryFn: () => rwaFetcher<RwaAssetsPage>(getAssetsUrl(query)),
    placeholderData: keepPreviousData,
  }
}

export function assetsSearchQueryOptions(query: string, limit?: number): RwaQueryOptions<RwaAssetsSearchResult> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'assets-search', query, limit],
    queryFn: () => rwaFetcher<RwaAssetsSearchResult>(getAssetsSearchUrl(query, limit)),
    placeholderData: keepPreviousData,
    enabled: query.length > 0,
  }
}

/** Requests `tickers` in batches that fit a single `/api/v1/assets` page. Degraded when any page is */
export async function fetchAssetsByTickers(tickers: string[]): Promise<RwaAssetsByTickers> {
  const batches: string[][] = []

  for (let index = 0; index < tickers.length; index += MAX_ASSETS_PAGE_TICKERS) {
    batches.push(tickers.slice(index, index + MAX_ASSETS_PAGE_TICKERS))
  }

  const pages = await Promise.all(
    batches.map((batch) =>
      rwaFetcher<RwaAssetsPage>(
        getAssetsUrl({ page: 1, pageSize: MAX_ASSETS_PAGE_TICKERS, sort: 'ticker', order: 'asc', tickers: batch }),
      ),
    ),
  )

  return { items: pages.flatMap((page) => page.items), degraded: pages.some((page) => page.degraded) }
}

/** `/api/v1/market-overview` caches the overview for the same interval */
export function marketOverviewQueryOptions(): RwaQueryOptions<RwaMarketOverview> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'market-overview'],
    queryFn: () => rwaFetcher<RwaMarketOverview>(getMarketOverviewUrl()),
    placeholderData: keepPreviousData,
    refetchInterval: MARKET_REFRESH_INTERVAL_MS,
  }
}

export function tokenListQueryOptions(): RwaQueryOptions<RwaTokenList> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'token-list'],
    queryFn: () => rwaFetcher<RwaTokenList>(getTokenListUrl()),
    staleTime: TOKEN_LIST_STALE_TIME_MS,
  }
}

export const assetNewsQueryAtomFamily = atomFamily((ticker: string) =>
  atomWithQuery(() => assetNewsQueryOptions(ticker)),
)

export const assetQueryAtomFamily = atomFamily((ticker: string) => atomWithQuery(() => assetQueryOptions(ticker)))

export const tokenListQueryAtom = atomWithQuery(() => tokenListQueryOptions())
