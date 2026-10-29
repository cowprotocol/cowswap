'use client'

import { useAtomValue, useStore } from 'jotai'
import { useEffect } from 'react'

import { queryClientAtom } from 'jotai-tanstack-query'

import { chartRangeAtom } from './chartRangeAtom'
import { chartTypeAtom } from './chartTypeAtom'

import { assetCandlesQueryOptions, assetChartQueryOptions } from '@/entities/asset'

const PREFETCH_DELAY_MS = 1000

/** Loads the chart type that isn't shown a second after the shown one, so switching to it is instant */
export function usePrefetchOtherChartType(ticker: string): void {
  const store = useStore()
  const queryClient = useAtomValue(queryClientAtom)
  const range = useAtomValue(chartRangeAtom)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (store.get(chartTypeAtom) === 'line') {
        const { queryKey, queryFn } = assetCandlesQueryOptions(ticker, range)
        void queryClient.prefetchQuery({ queryKey, queryFn })
      } else {
        const { queryKey, queryFn } = assetChartQueryOptions(ticker, range)
        void queryClient.prefetchQuery({ queryKey, queryFn })
      }
    }, PREFETCH_DELAY_MS)

    return () => clearTimeout(timer)
  }, [queryClient, range, store, ticker])
}
