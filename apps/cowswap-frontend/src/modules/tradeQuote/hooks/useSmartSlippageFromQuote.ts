import { useEffect, useRef } from 'react'

import { MAX_SLIPPAGE_BPS, MINIMUM_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { clampValue } from '@cowprotocol/common-utils'

import { useIsEoaEthFlow } from 'modules/trade'

import { useTradeQuote } from './useTradeQuote'

import { getIsFastQuote } from '../utils/getIsFastQuote'

export const useSmartSlippageFromQuote = (): number | null => {
  const tradeQuote = useTradeQuote()
  const isEthFlow = useIsEoaEthFlow()
  const lastSlippageRef = useRef<number | null>(null)

  const slippage = getIsFastQuote(tradeQuote.fetchParams)
    ? // eslint-disable-next-line react-hooks/refs
      lastSlippageRef.current
    : (tradeQuote?.quote?.quoteResults.suggestedSlippageBps ?? lastSlippageRef.current)

  useEffect(() => {
    lastSlippageRef.current = slippage
  }, [slippage])

  if (tradeQuote.error || typeof slippage !== 'number') return null

  return clampValue(slippage, isEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS : 0, MAX_SLIPPAGE_BPS)
}
