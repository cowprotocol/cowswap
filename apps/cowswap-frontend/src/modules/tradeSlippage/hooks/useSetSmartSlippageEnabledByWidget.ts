import { useSetAtom } from 'jotai'

import { setIsSmartSlippageEnabledByWidgetAtom } from '../state/slippageValueAndTypeAtom'

export function useSetSmartSlippageEnabledByWidget(): (isEnabled: boolean) => void {
  return useSetAtom(setIsSmartSlippageEnabledByWidgetAtom)
}
