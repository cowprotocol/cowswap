import { useUserTransactionTTL } from 'legacy/state/user/hooks'

import { useTradeFlowContext } from 'modules/tradeFlow'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

interface SwapFlowContext {
  defaultPartiallyFillable: boolean
}

export function useSwapFlowContext({ defaultPartiallyFillable }: SwapFlowContext) {
  const [deadline] = useUserTransactionTTL()
  return useTradeFlowContext(useSafeMemoObject({ deadline, defaultPartiallyFillable }))
}
