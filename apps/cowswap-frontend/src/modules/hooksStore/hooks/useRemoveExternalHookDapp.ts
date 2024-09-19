import { useSetAtom } from 'jotai'

import { removeExternalHookDappsAtom } from '../state/externalHookDappsAtom'

export function useRemoveExternalHookDapp() {
  return useSetAtom(removeExternalHookDappsAtom)
}
