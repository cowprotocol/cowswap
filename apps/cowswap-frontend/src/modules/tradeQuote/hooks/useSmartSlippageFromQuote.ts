import { useRef } from 'react'

import { MAX_SLIPPAGE_BPS, MINIMUM_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'

import { useIsEoaEthFlow } from 'modules/trade'

import { useTradeQuote } from './useTradeQuote'

import { getIsFastQuote } from '../utils/getIsFastQuote'

export const useSmartSlippageFromQuote = (): number | null => {
  const tradeQuote = useTradeQuote()
  const isEthFlow = useIsEoaEthFlow()
  const lastValidSlippageRef = useRef<number | null>(null)
  const rawSlippage = tradeQuote?.quote?.quoteResults.suggestedSlippageBps ?? null

  if (tradeQuote.error) return null

  // eslint-disable-next-line react-hooks/refs
  if (typeof rawSlippage !== 'number' || getIsFastQuote(tradeQuote.fetchParams)) return lastValidSlippageRef.current

  const bottomCap = isEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS : 0

  if (rawSlippage < bottomCap || rawSlippage > MAX_SLIPPAGE_BPS) return null

  // eslint-disable-next-line react-hooks/refs
  lastValidSlippageRef.current = rawSlippage

  return rawSlippage
}
