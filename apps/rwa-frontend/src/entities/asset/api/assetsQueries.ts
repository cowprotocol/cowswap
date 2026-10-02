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
  getQuotesUrl,
  getTokenListUrl,
} from './assetsApi'

import type {
  RwaAssetQuotes,
  RwaAssetResponse,
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
/** Same as the `/api/v1/token-list` cache max-age */
const TOKEN_LIST_STALE_TIME_MS = 60 * 60 * 1000

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

export const assetQueryAtomFamily = atomFamily((ticker: string) => atomWithQuery(() => assetQueryOptions(ticker)))

export const tokenListQueryAtom = atomWithQuery(() => tokenListQueryOptions())
