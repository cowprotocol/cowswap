import { useAtomValue } from 'jotai'

import { currentPoolsInfoAtom } from '../state/poolsInfoAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePoolsInfo() {
  return useAtomValue(currentPoolsInfoAtom)
}
