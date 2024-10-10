import { useUserTransactionTTL } from 'legacy/state/user/hooks'

import { useTradeFlowContext } from 'modules/trade'

export function useSwapFlowContext() {
  const [deadline] = useUserTransactionTTL()
  return useTradeFlowContext({ deadline })
}
