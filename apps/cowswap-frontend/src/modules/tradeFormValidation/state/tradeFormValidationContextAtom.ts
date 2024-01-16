import { atom } from 'jotai'

import { TradeFormValidationContext } from '../types'

export const tradeFormValidationContextAtom = atom<TradeFormValidationContext | null>(null)
