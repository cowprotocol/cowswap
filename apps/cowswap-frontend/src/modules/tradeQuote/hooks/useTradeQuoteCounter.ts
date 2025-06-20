import { useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'

import { tradeQuoteCounterAtom } from '../state/tradeQuoteCounterAtom'

export function useTradeQuoteCounter(): number {
  return useAtomValue(tradeQuoteCounterAtom)
}

export function useResetQuoteCounter(): () => void {
  return useResetAtom(tradeQuoteCounterAtom)
}
