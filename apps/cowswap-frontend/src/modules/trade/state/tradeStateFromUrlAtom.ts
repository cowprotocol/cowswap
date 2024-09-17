import { atom } from 'jotai'

import { TradeRawState } from '../types/TradeRawState'

export const tradeStateFromUrlAtom = atom<TradeRawState | null>(null)
