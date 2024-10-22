import { useSetAtom } from 'jotai'

import { updateYieldRawStateAtom } from '../state/yieldRawStateAtom'

export function useUpdateYieldRawState() {
  return useSetAtom(updateYieldRawStateAtom)
}
