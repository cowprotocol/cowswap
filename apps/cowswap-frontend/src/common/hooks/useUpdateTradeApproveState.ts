import { useSetAtom } from 'jotai'

import { updateTradeApproveStateAtom } from '../containers/TradeApprove/tradeApproveStateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateTradeApproveState() {
  return useSetAtom(updateTradeApproveStateAtom)
}
