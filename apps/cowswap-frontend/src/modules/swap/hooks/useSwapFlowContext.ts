import { usePartialApprove, useUserTransactionTTL } from 'legacy/state/user/hooks'

import { useTradeFlowContext } from 'modules/tradeFlow'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

export function useSwapFlowContext() {
  const [deadline] = useUserTransactionTTL()
  const [isPartialApprove] = usePartialApprove()

  return useTradeFlowContext(useSafeMemoObject({ deadline, isPartialApprove }))
}
