import { atomWithStorage } from 'jotai/utils'

import type { RwaSortField, RwaSortOrder } from '@/entities/asset'

export interface AssetsSortState {
  sort: RwaSortField
  order: RwaSortOrder
}

export const assetsSortAtom = atomWithStorage<AssetsSortState>('rwaAssetsSort:v1', { sort: 'priority', order: 'desc' })
