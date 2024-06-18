import { atom } from 'jotai'

import { TradeTypeInfo } from '../types'

export const tradeTypeAtom = atom<TradeTypeInfo | null>(null)
