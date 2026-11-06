import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

import { chartRangeAtom } from './chartRangeAtom'
import { chartTypeAtom } from './chartTypeAtom'
import { shownMarketKindAtomFamily } from './marketKindAtom'

import { assetCandlesQueryOptions, assetChartQueryOptions } from '@/entities/asset'

export const assetChartQueryAtomFamily = atomFamily((ticker: string) =>
  atomWithQuery((get) => ({
    ...assetChartQueryOptions(ticker, get(chartRangeAtom), get(shownMarketKindAtomFamily(ticker))),
    enabled: get(chartTypeAtom) === 'line',
  })),
)

export const assetCandlesQueryAtomFamily = atomFamily((ticker: string) =>
  atomWithQuery((get) => ({
    ...assetCandlesQueryOptions(ticker, get(chartRangeAtom), get(shownMarketKindAtomFamily(ticker))),
    enabled: get(chartTypeAtom) === 'candles',
  })),
)

/** Shares the cache of the 1Y price chart */
export const assetYearChartQueryAtomFamily = atomFamily((ticker: string) =>
  atomWithQuery((get) => assetChartQueryOptions(ticker, '1Y', get(shownMarketKindAtomFamily(ticker)))),
)

/** Of the tokenized market, which `useAssetMarket` takes its 24h stats from */
export const assetDailyChartQueryAtomFamily = atomFamily((ticker: string) =>
  atomWithQuery(() => assetChartQueryOptions(ticker, '1D', 'tokenized')),
)
