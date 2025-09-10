import { useSetAtom } from 'jotai'

import { ChangeApproveModalState, updateChangeApproveAmountModalAtom } from '../containers/ChangeApproveAmountModal'

export function useSetChangeApproveAmountModalState(): (nextState: Partial<ChangeApproveModalState>) => void {
  return useSetAtom(updateChangeApproveAmountModalAtom)
}
