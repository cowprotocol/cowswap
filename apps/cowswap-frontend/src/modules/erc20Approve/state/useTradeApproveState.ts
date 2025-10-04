import { useAtomValue } from 'jotai'

import { TradeApproveState, tradeApproveStateAtom } from '../index'

export function useTradeApproveState(): TradeApproveState {
  return useAtomValue(tradeApproveStateAtom)
}
