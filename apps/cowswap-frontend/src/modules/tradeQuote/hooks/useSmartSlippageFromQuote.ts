import { MAX_SLIPPAGE_BPS } from '@cowprotocol/common-const'

import { useTradeQuote } from './useTradeQuote'

export const useSmartSlippageFromQuote = (): number | null => {
  const tradeQuote = useTradeQuote()
  const slippage = tradeQuote?.quote?.quoteResults.suggestedSlippageBps || null
  return slippage ? Math.min(slippage, MAX_SLIPPAGE_BPS) : null
}
