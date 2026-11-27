import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

import { assetsByTickersQueryOptions } from '@/entities/asset'

/** `tickersKey` comes from `getHeldTickersKey`. An empty key requests nothing */
export const portfolioMarketsQueryAtomFamily = atomFamily((tickersKey: string) =>
  atomWithQuery(() => assetsByTickersQueryOptions(tickersKey ? tickersKey.split(',') : [])),
)
