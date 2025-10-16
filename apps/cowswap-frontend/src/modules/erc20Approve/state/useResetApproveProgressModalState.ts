import { useResetAtom } from 'jotai/utils'

import { approveProgressModalStateAtom } from '../containers'

export function useResetApproveProgressModalState(): () => void {
  return useResetAtom(approveProgressModalStateAtom)
}
