import { useSetAtom } from 'jotai'

import { ChangeTradeApproveState, updateChangeApproveAmountStateAtom } from '../containers/ChangeApproveAmountModal'

export function useSetChangeApproveAmountState(): (nextState: Partial<ChangeTradeApproveState>) => void {
  return useSetAtom(updateChangeApproveAmountStateAtom)
}
