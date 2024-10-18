import { useAtomValue } from 'jotai/index'

import { isEoaEthFlowAtom } from '../state/isEoaEthFlowAtom'

export function useIsEoaEthFlow(): boolean {
  return useAtomValue(isEoaEthFlowAtom)
}
