import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import type { RwaQuoteSide } from '@/entities/asset'

// Read on mount, not on init: the trade panel is rendered on the server with the defaults
const storedTradeSideAtom = atomWithStorage<RwaQuoteSide>('rwaTradeSide:v1', 'buy')
const storedTradeTokenKeyAtom = atomWithStorage<string | null>('rwaTradeTokenKey:v1', null)

/** Side the user last picked, kept across page loads */
export const tradeSideAtom = atom(
  (get): RwaQuoteSide => (get(storedTradeSideAtom) === 'sell' ? 'sell' : 'buy'),
  (_get, set, side: RwaQuoteSide) => set(storedTradeSideAtom, side),
)

/**
 * `getTokenKey` of the asset token picked by the user, `null` to pick the best quote. Kept across page loads; a key
 * of another asset's token matches none of this asset's tokens, so it falls back to the best quote.
 */
export const tradeTokenKeyAtom = atom(
  (get): string | null => {
    const tokenKey = get(storedTradeTokenKeyAtom)

    return typeof tokenKey === 'string' ? tokenKey : null
  },
  (_get, set, tokenKey: string | null) => set(storedTradeTokenKeyAtom, tokenKey),
)

/** Network picked in the selector, used while the wallet isn't on a network of the asset */
export const tradeChainIdAtom = atom<number | null>(null)
