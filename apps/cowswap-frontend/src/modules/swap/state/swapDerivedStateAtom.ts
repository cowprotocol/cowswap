import { atom } from 'jotai'

import { DEFAULT_TRADE_DERIVED_STATE, TradeDerivedState } from '../../trade/types/TradeDerivedState'

export interface SwapDerivedState extends TradeDerivedState {}

export const swapDerivedStateAtom = atom<SwapDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
})
