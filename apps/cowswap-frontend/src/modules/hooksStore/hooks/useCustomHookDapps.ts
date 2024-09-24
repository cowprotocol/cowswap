import { useAtomValue } from 'jotai/index'

import { customHookDappsAtom } from '../state/customHookDappsAtom'

export function useCustomHookDapps() {
  return useAtomValue(customHookDappsAtom)
}
