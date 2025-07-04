import { useAtomValue } from 'jotai'

import { slippageConfigAtom } from '../state/slippageValueAndTypeAtom'

export function useSlippageConfig(): { defaultValue: number; max: number; min: number } {
  return useAtomValue(slippageConfigAtom)
}
