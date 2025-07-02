import { useTradeQuote } from './useTradeQuote'

export const useSmartSlippageFromQuote = (): number | null => {
  const tradeQuote = useTradeQuote()
  return  tradeQuote?.quote?.quoteResults.suggestedSlippageBps || null
}
