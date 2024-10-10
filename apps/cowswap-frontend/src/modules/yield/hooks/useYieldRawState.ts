import { useAtomValue } from 'jotai'

import { yieldRawStateAtom } from '../state/yieldRawStateAtom'

export function useYieldRawState() {
  return useAtomValue(yieldRawStateAtom)
}
