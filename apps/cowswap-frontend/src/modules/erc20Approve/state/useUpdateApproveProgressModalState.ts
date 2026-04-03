import { useSetAtom } from 'jotai'

import { updateApproveProgressStateAtom } from '../containers'

export type UpdateApproveProgressModalState = ReturnType<typeof useSetAtom<typeof updateApproveProgressStateAtom>>

export function useUpdateApproveProgressModalState(): UpdateApproveProgressModalState {
  return useSetAtom(updateApproveProgressStateAtom)
}
