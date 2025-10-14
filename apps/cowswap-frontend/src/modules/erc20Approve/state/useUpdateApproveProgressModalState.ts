import { useSetAtom } from 'jotai'

import { updateApproveProgressStateAtom } from '../containers'

export function useUpdateApproveProgressModalState(): ReturnType<
  typeof useSetAtom<typeof updateApproveProgressStateAtom>
> {
  return useSetAtom(updateApproveProgressStateAtom)
}
