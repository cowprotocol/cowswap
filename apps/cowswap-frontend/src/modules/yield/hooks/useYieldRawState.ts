import { useAtomValue } from 'jotai'

import { yieldRawStateAtom } from '../state/yieldRawStateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useYieldRawState() {
  return useAtomValue(yieldRawStateAtom)
}
