import { useAtomValue } from 'jotai'

import { ApproveProgressModalState, approveProgressModalStateAtom } from '../index'

export function useTradeApproveState(): ApproveProgressModalState {
  return useAtomValue(approveProgressModalStateAtom)
}
