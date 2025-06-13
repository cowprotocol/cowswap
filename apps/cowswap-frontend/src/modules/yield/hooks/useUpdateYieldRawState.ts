import { useSetAtom } from 'jotai'

import { updateYieldRawStateAtom } from '../state/yieldRawStateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateYieldRawState() {
  return useSetAtom(updateYieldRawStateAtom)
}
