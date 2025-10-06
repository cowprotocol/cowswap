import { useSetAtom } from 'jotai'

import { updateUserApproveAmountModalAtom, UserApproveModalState } from '../containers/ChangeApproveAmountModal'

export function useSetUserApproveAmountModalState(): (nextState: Partial<UserApproveModalState>) => void {
  return useSetAtom(updateUserApproveAmountModalAtom)
}
