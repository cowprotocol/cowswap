import { useSetAtom } from 'jotai'

import { setShouldUseAutoSlippageAtom } from '../state/slippageValueAndTypeAtom'

export function useSetShouldUseAutoSlippage(): (isEnabled: boolean) => void {
  return useSetAtom(setShouldUseAutoSlippageAtom)
}
