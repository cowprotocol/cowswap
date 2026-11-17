import { atomWithStorage } from 'jotai/utils'

import { type AssetsSortState, DEFAULT_ASSETS_SORT } from './assetsPageQuery'

export const assetsSortAtom = atomWithStorage<AssetsSortState>('rwaAssetsSort:v3', DEFAULT_ASSETS_SORT)
