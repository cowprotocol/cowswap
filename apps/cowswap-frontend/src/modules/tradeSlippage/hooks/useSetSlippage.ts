import { useSetAtom } from 'jotai'

import { setUserSlippageAtom } from '../state/slippageValueAndTypeAtom'

export function useSetSlippage(): (slippageBps: number | null) => void {
  return useSetAtom(setUserSlippageAtom)
}
