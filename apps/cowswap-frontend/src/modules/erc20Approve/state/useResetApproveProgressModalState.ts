import { useSetAtom } from 'jotai'

import { resetApproveProgressStateAtom } from '../containers'

export function useResetApproveProgressModalState(): () => void {
  return useSetAtom(resetApproveProgressStateAtom)
}
