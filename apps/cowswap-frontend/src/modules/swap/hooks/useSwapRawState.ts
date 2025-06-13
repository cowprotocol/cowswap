import { useAtomValue } from 'jotai'

import { swapRawStateAtom } from '../state/swapRawStateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSwapRawState() {
  return useAtomValue(swapRawStateAtom)
}
