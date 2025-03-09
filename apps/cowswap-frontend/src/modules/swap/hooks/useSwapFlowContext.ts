import { useTradeFlowContext } from 'modules/tradeFlow'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { useSwapDeadlineState } from './useSwapSettings'

export function useSwapFlowContext() {
  const [deadline] = useSwapDeadlineState()
  return useTradeFlowContext(useSafeMemoObject({ deadline }))
}
