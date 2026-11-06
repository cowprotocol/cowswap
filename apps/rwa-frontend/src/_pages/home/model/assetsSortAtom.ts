import { atomWithStorage } from 'jotai/utils'

import type { RwaSortField, RwaSortOrder } from '@/entities/asset'

export interface AssetsSortState {
  sort: RwaSortField
  order: RwaSortOrder
}

export const assetsSortAtom = atomWithStorage<AssetsSortState>('rwaAssetsSort:v3', {
  sort: 'volume24h',
  order: 'desc',
})
