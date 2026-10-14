import { atomWithQuery } from 'jotai-tanstack-query'

import { assetsPageQueryOptions } from '@/entities/asset'

/** The `/api/v1/assets` maximum, which fits the whole registry */
const MARKETS_PAGE_SIZE = 100

export const portfolioMarketsQueryAtom = atomWithQuery(() =>
  assetsPageQueryOptions({ page: 1, pageSize: MARKETS_PAGE_SIZE, sort: 'priority', order: 'desc' }),
)
