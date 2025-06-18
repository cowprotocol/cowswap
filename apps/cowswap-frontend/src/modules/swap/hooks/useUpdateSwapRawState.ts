import { useSetAtom } from 'jotai'

import { updateSwapRawStateAtom } from '../state/swapRawStateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateSwapRawState() {
  return useSetAtom(updateSwapRawStateAtom)
}
