import { useAtomValue } from 'jotai'

import { currentTradeQuoteAtom, TradeQuoteState } from '../state/tradeQuoteAtom'

export function useTradeQuote(): TradeQuoteState {
  return useAtomValue(currentTradeQuoteAtom)
}
