import { useSetAtom } from 'jotai'

import { updateSwapRawStateAtom } from '../state/swapRawStateAtom'

export function useUpdateSwapRawState() {
  return useSetAtom(updateSwapRawStateAtom)
}
