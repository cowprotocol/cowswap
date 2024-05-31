import { useAtomValue } from 'jotai'

import { TradeDerivedState } from 'modules/trade/types/TradeDerivedState'

import { derivedTradeStateAtom } from '../state/derivedTradeStateAtom'

export function useDerivedTradeState(): TradeDerivedState | null {
  return useAtomValue(derivedTradeStateAtom)
}
