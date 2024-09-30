import { useSetAtom } from 'jotai'

import { removeCustomHookDappAtom } from '../state/customHookDappsAtom'

export function useRemoveCustomHookDapp() {
  return useSetAtom(removeCustomHookDappAtom)
}
