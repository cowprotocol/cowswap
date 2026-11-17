import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import { type AssetsSortState, DEFAULT_ASSETS_SORT } from './assetsPageQuery'

const ASSETS_SORT_STORAGE_KEY = 'rwaAssetsSort:v3'

const sortStorage = createJSONStorage<AssetsSortState>()

export const assetsSortAtom = atomWithStorage<AssetsSortState>(
  ASSETS_SORT_STORAGE_KEY,
  DEFAULT_ASSETS_SORT,
  sortStorage,
)

export function readStoredAssetsSort(): AssetsSortState {
  return sortStorage.getItem(ASSETS_SORT_STORAGE_KEY, DEFAULT_ASSETS_SORT)
}
