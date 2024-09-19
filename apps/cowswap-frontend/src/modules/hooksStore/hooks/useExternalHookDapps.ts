import { useAtomValue } from 'jotai/index'

import { externalHookDappsAtom } from '../state/externalHookDappsAtom'

export function useExternalHookDapps() {
  return useAtomValue(externalHookDappsAtom)
}
