import { useAtomValue } from 'jotai'

import { currentPoolsInfoAtom } from '../state/poolsInfoAtom'

export function usePoolsInfo() {
  return useAtomValue(currentPoolsInfoAtom)
}
