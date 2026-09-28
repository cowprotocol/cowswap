import { atomWithQuery } from 'jotai-tanstack-query'

import { ASSETS_PAGE_SIZE, assetsPageAtom } from './assetsPageAtom'
import { debouncedAssetsSearchQueryAtom } from './assetsSearchQueryAtom'
import { assetsSortAtom } from './assetsSortAtom'

import { assetsPageQueryOptions, assetsSearchQueryOptions } from '@/entities/asset'

export const assetsPageQueryAtom = atomWithQuery((get) =>
  assetsPageQueryOptions({ page: get(assetsPageAtom), pageSize: ASSETS_PAGE_SIZE, ...get(assetsSortAtom) }),
)

export const assetsSearchQueryResultAtom = atomWithQuery((get) =>
  assetsSearchQueryOptions(get(debouncedAssetsSearchQueryAtom)),
)
