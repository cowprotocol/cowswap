import { useAtomValue } from 'jotai'

import { changeApproveAmountModalAtom, ChangeApproveModalState } from '../containers/ChangeApproveAmountModal'

export function useChangeApproveAmountState(): ChangeApproveModalState {
  return useAtomValue(changeApproveAmountModalAtom)
}
