import { atom } from 'jotai'


import { useTradeQuote } from './useTradeQuote'

import { tradeQuotesAtom } from '../state/tradeQuoteAtom'

export const tradeQuoteSlippageAtom = atom<number | null>((get) => {
  const { quote } = get(tradeQuotesAtom)
  
  return quote?.quote?.quoteResults.suggestedSlippageBps || null
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useTradeQuoteSlippage = () => {
  const tradeQuote = useTradeQuote()
  return tradeQuote?.quote?.quoteResults.suggestedSlippageBps || null
}
