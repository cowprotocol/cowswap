import { useAtomValue } from 'jotai'

import { isEoaEthFlowAtom } from '../state/isEoaEthFlowAtom'

export function useIsEoaEthFlow(): boolean {
  return useAtomValue(isEoaEthFlowAtom)
}
