import { atom } from 'jotai'

import { atomFamily } from 'jotai-family'

export type AssetAccountTab = 'overview' | 'positions' | 'orders' | 'activity'

export const assetAccountTabAtomFamily = atomFamily((_ticker: string) => atom<AssetAccountTab>('overview'))
