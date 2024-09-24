import { useSetAtom } from 'jotai'

import { addCustomHookDappAtom } from '../state/customHookDappsAtom'

export function useAddCustomHookDapp() {
  return useSetAtom(addCustomHookDappAtom)
}
