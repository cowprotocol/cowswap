import { useAtomValue } from 'jotai'

import { derivedTradeStateAtom } from '../state/derivedTradeStateAtom'
import { TradeDerivedState } from '../types/TradeDerivedState'

export function useDerivedTradeState(): TradeDerivedState | null {
  return useAtomValue(derivedTradeStateAtom)
}
