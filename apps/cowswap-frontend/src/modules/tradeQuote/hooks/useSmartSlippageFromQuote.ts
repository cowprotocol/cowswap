import { MAX_SLIPPAGE_BPS, MINIMUM_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'

import { useIsEoaEthFlow } from 'modules/trade'

import { useTradeQuote } from './useTradeQuote'

export const useSmartSlippageFromQuote = (): number | null => {
  const tradeQuote = useTradeQuote()
  const isEthFlow = useIsEoaEthFlow()

  const slippageBottomCap = isEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS : 0
  const slippageTopCap = MAX_SLIPPAGE_BPS

  const slippage = tradeQuote?.quote?.quoteResults.suggestedSlippageBps ?? null

  if (typeof slippage === 'number') {
    if (slippage < slippageBottomCap) return null
    if (slippage > slippageTopCap) return null
  }

  return slippage
}
