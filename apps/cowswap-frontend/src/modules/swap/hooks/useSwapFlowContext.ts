import { TradeFlowContext, useTradeFlowContext } from 'modules/tradeFlow'

import { useSwapDeadlineState, useSwapSettings } from './useSwapSettings'

export function useSwapFlowContext(): TradeFlowContext | null {
  const [deadline] = useSwapDeadlineState()
  const { enablePartialApprovalBySettings } = useSwapSettings()

  return useTradeFlowContext({ deadline, partialApproveEnabled: enablePartialApprovalBySettings })
}
