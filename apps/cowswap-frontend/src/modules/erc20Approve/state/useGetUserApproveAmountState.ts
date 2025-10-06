import { useAtomValue } from 'jotai'

import { userApproveAmountModalAtom, UserApproveModalState } from '../containers/ChangeApproveAmountModal'

export function useGetUserApproveAmountState(): UserApproveModalState {
  return useAtomValue(userApproveAmountModalAtom)
}
