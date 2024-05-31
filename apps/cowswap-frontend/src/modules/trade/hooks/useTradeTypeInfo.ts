import { useAtomValue } from 'jotai'

import { tradeTypeAtom } from '../state/tradeTypeAtom'
import { TradeTypeInfo } from '../types'

export function useTradeTypeInfo(): TradeTypeInfo | null {
  return useAtomValue(tradeTypeAtom)
}
