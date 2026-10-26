import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

import { chartRangeAtom } from './chartRangeAtom'

import { assetChartQueryOptions } from '@/entities/asset'

export const assetChartQueryAtomFamily = atomFamily((ticker: string) =>
  atomWithQuery((get) => assetChartQueryOptions(ticker, get(chartRangeAtom))),
)

export const assetDailyChartQueryAtomFamily = atomFamily((ticker: string) =>
  atomWithQuery(() => assetChartQueryOptions(ticker, '1D')),
)
