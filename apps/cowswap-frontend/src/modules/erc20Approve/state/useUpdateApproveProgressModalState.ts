import { useSetAtom } from 'jotai'

import { updateApproveProgressStateAtom } from '../containers'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateApproveProgressModalState() {
  return useSetAtom(updateApproveProgressStateAtom)
}
