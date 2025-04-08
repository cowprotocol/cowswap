import { useSetAtom } from 'jotai/index'

import { updateTradeApproveStateAtom } from '../containers/TradeApprove/tradeApproveStateAtom'

export function useUpdateTradeApproveState() {
  return useSetAtom(updateTradeApproveStateAtom)
}
