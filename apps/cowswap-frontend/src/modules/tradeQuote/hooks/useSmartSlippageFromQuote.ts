import { atom } from 'jotai'


import { useTradeQuote } from './useTradeQuote'

import { tradeQuotesAtom } from '../state/tradeQuoteAtom'

export const tradeQuoteSlippageAtom = atom<number | null>((get) => {
  const { quote } = get(tradeQuotesAtom)
  
  return quote?.quote?.quoteResults.suggestedSlippageBps || null
})

export const useSmartSlippageFromQuote = (): number | null => {
  const tradeQuote = useTradeQuote()
  return tradeQuote?.quote?.quoteResults.suggestedSlippageBps || null
}
