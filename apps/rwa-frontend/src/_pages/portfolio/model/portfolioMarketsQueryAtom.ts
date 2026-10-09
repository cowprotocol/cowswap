import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

import { MAX_PORTFOLIO_MARKETS } from '../lib/heldTickers'

import { assetsPageQueryOptions } from '@/entities/asset'

/** `tickersKey` comes from `getHeldTickersKey`. An empty key requests nothing */
export const portfolioMarketsQueryAtomFamily = atomFamily((tickersKey: string) =>
  atomWithQuery(() => ({
    ...assetsPageQueryOptions({
      page: 1,
      pageSize: MAX_PORTFOLIO_MARKETS,
      sort: 'ticker',
      order: 'asc',
      tickers: tickersKey.split(','),
    }),
    enabled: tickersKey.length > 0,
  })),
)
