import { MAX_SLIPPAGE_BPS, MINIMUM_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'

import { useIsEoaEthFlow } from 'modules/trade'

import { useTradeQuote } from './useTradeQuote'

export const useSmartSlippageFromQuote = (): number | null => {
  const tradeQuote = useTradeQuote()
  const isEthFlow = useIsEoaEthFlow()

  const slippageBottomCap = isEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS : 0
  const slippageTopCap = MAX_SLIPPAGE_BPS

  // get slippageBps from previous cached result, otherwise quote.quoteResults.suggestedSlippageBps usage causes re-fetch quote loop problem (#6675)
  const slippage = tradeQuote?.suggestedSlippageBps || null

  if (typeof slippage === 'number') {
    if (slippage < slippageBottomCap) return null
    if (slippage > slippageTopCap) return null
  }

  return slippage
}
