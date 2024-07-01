import { useAtomValue } from 'jotai/index'

import { isCurrentSlippageDefault } from '../state/swapSlippageAtom'

export function useIsCurrentSlippageDefault() {
  return useAtomValue(isCurrentSlippageDefault)
}
