import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

import { chartRangeAtom } from './chartRangeAtom'
import { chartTypeAtom } from './chartTypeAtom'

import { assetCandlesQueryOptions, assetChartQueryOptions } from '@/entities/asset'

export const assetChartQueryAtomFamily = atomFamily((ticker: string) =>
  atomWithQuery((get) => ({
    ...assetChartQueryOptions(ticker, get(chartRangeAtom)),
    enabled: get(chartTypeAtom) === 'line',
  })),
)

export const assetCandlesQueryAtomFamily = atomFamily((ticker: string) =>
  atomWithQuery((get) => ({
    ...assetCandlesQueryOptions(ticker, get(chartRangeAtom)),
    enabled: get(chartTypeAtom) === 'candles',
  })),
)

export const assetDailyChartQueryAtomFamily = atomFamily((ticker: string) =>
  atomWithQuery(() => assetChartQueryOptions(ticker, '1D')),
)
