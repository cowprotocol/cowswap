import { useAtomValue } from 'jotai'

import { tradeApproveStateAtom } from '../index'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useTradeApproveState() {
  return useAtomValue(tradeApproveStateAtom)
}
