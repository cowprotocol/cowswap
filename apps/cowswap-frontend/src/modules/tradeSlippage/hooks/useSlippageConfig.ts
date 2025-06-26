import { useAtomValue } from 'jotai'

import { slippageConfigAtom } from '../state/slippageValueAndTypeAtom'

export function useSlippageConfig(): { default: number; max: number; min: number } {
  return useAtomValue(slippageConfigAtom)
}
