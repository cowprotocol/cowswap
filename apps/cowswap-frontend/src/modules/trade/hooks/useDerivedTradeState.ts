import { useAtomValue } from 'jotai'

import { TradeDerivedState } from 'modules/trade'

import { derivedTradeStateAtom } from '../state/derivedTradeStateAtom'

export function useDerivedTradeState(): TradeDerivedState | null {
  return useAtomValue(derivedTradeStateAtom)
}
