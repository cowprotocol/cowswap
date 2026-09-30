import { atom } from 'jotai'

import type { TradeSide } from '../lib/tradeLeg'

export const tradeSideAtom = atom<TradeSide>('buy')

/** `getTokenKey` of the asset token to trade, `null` for the default token of the chain */
export const tradeTokenKeyAtom = atom<string | null>(null)
