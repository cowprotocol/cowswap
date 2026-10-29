import { useAtomValue, useSetAtom } from 'jotai'

import { setShouldUseAutoSlippageAtom, shouldUseAutoSlippageAtom } from '../state/slippageValueAndTypeAtom'

export function useSetShouldUseAutoSlippage(): (isEnabled: boolean) => void {
  return useSetAtom(setShouldUseAutoSlippageAtom)
}

export function useShouldUseAutoSlippage(): boolean {
  return useAtomValue(shouldUseAutoSlippageAtom)
}
