import { useSetAtom } from 'jotai'

import { addExternalHookDappsAtom } from '../state/externalHookDappsAtom'

export function useAddExternalHookDapp() {
  return useSetAtom(addExternalHookDappsAtom)
}
