import { useAtomValue } from 'jotai'

import { tradeApproveStateAtom } from '../containers/TradeApprove/tradeApproveStateAtom'

export function useTradeApproveState() {
  return useAtomValue(tradeApproveStateAtom)
}
