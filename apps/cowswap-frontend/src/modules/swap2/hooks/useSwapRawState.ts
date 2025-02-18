import { useAtomValue } from 'jotai'

import { swapRawStateAtom } from '../state/swapRawStateAtom'

export function useSwapRawState() {
  return useAtomValue(swapRawStateAtom)
}
