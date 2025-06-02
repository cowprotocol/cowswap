import { useSetAtom } from 'jotai'

import { updateTradeApproveStateAtom } from '../containers/TradeApprove/tradeApproveStateAtom'

export function useUpdateTradeApproveState() {
  return useSetAtom(updateTradeApproveStateAtom)
}
