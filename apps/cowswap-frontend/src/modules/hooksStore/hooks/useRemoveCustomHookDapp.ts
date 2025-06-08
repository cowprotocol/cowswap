import { useSetAtom } from 'jotai'

import { removeCustomHookDappAtom } from '../state/customHookDappsAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRemoveCustomHookDapp() {
  return useSetAtom(removeCustomHookDappAtom)
}
