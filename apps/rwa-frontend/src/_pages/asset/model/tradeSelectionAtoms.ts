import { atom } from 'jotai'

import type { RwaQuoteSide } from '@/entities/asset'

export const tradeSideAtom = atom<RwaQuoteSide>('buy')

/** `getTokenKey` of the asset token picked by the user, `null` to pick the best quote */
export const tradeTokenKeyAtom = atom<string | null>(null)

/** Network picked in the selector, used while the wallet isn't on a network of the asset */
export const tradeChainIdAtom = atom<number | null>(null)
