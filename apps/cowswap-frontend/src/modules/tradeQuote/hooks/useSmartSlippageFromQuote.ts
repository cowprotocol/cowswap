import { atom } from 'jotai'


import { MAX_SLIPPAGE_BPS } from '@cowprotocol/common-const'

import { useTradeQuote } from './useTradeQuote'

import { tradeQuotesAtom } from '../state/tradeQuoteAtom'

export const tradeQuoteSlippageAtom = atom<number | null>((get) => {
  const { quote } = get(tradeQuotesAtom)
  
  return quote?.quote?.quoteResults.suggestedSlippageBps || null
})

export const useSmartSlippageFromQuote = (): number | null => {
  const tradeQuote = useTradeQuote()
  const slippage = tradeQuote?.quote?.quoteResults.suggestedSlippageBps || null
  return slippage ? Math.min(slippage, MAX_SLIPPAGE_BPS) : null
}
