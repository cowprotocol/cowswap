import { useUserTransactionTTL } from 'legacy/state/user/hooks'

import { useTradeFlowContext } from 'modules/tradeFlow'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

export function useSwapFlowContext() {
  const [deadline] = useUserTransactionTTL()
  return useTradeFlowContext(useSafeMemoObject({ deadline }))
}
