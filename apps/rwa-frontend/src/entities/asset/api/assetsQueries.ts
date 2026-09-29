import { keepPreviousData } from '@tanstack/query-core'

import { atomFamily } from 'jotai-family'
import { type AtomWithQueryOptions, atomWithQuery } from 'jotai-tanstack-query'

import {
  type AssetsPageQuery,
  getAssetsSearchUrl,
  getAssetsUrl,
  getAssetUrl,
  getChartUrl,
  getTokenListUrl,
} from './assetsApi'

import type {
  RwaAssetResponse,
  RwaAssetsPage,
  RwaAssetsSearchResult,
  RwaChart,
  RwaChartRange,
  RwaTokenList,
} from '../model/types'

import { RWA_QUERY_KEY_ROOT, rwaFetcher } from '@/shared/api'

type RwaQueryOptions<T> = AtomWithQueryOptions<T, Error>

const MARKET_REFRESH_INTERVAL_MS = 60_000

export function assetChartQueryOptions(ticker: string, range: RwaChartRange): RwaQueryOptions<RwaChart> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'chart', ticker, range],
    queryFn: () => rwaFetcher<RwaChart>(getChartUrl(ticker, range)),
    placeholderData: keepPreviousData,
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

export function assetsPageQueryOptions(query: AssetsPageQuery): RwaQueryOptions<RwaAssetsPage> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'assets', query],
    queryFn: () => rwaFetcher<RwaAssetsPage>(getAssetsUrl(query)),
    placeholderData: keepPreviousData,
  }
}

export function assetsSearchQueryOptions(query: string): RwaQueryOptions<RwaAssetsSearchResult> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'assets-search', query],
    queryFn: () => rwaFetcher<RwaAssetsSearchResult>(getAssetsSearchUrl(query)),
    placeholderData: keepPreviousData,
    enabled: query.length > 0,
  }
}

export function tokenListQueryOptions(): RwaQueryOptions<RwaTokenList> {
  return {
    queryKey: [RWA_QUERY_KEY_ROOT, 'token-list'],
    queryFn: () => rwaFetcher<RwaTokenList>(getTokenListUrl()),
    staleTime: Infinity,
  }
}

export const assetQueryAtomFamily = atomFamily((ticker: string) => atomWithQuery(() => assetQueryOptions(ticker)))

export const tokenListQueryAtom = atomWithQuery(() => tokenListQueryOptions())
