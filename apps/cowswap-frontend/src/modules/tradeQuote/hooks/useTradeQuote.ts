import { useAtomValue } from 'jotai'

import { currentTradeQuoteAtom } from '../state/tradeQuoteAtom'
import { TradeQuoteState } from '../state/tradeQuoteAtom'

export function useTradeQuote(): TradeQuoteState {
  return useAtomValue(currentTradeQuoteAtom)
}
