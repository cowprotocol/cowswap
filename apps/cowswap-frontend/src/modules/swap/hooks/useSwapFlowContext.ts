import { TradeFlowContext, useTradeFlowContext } from 'modules/tradeFlow'

import { useSwapDeadlineState } from './useSwapSettings'

export function useSwapFlowContext(): TradeFlowContext | null {
  const [deadline] = useSwapDeadlineState()

  return useTradeFlowContext({ deadline })
}
