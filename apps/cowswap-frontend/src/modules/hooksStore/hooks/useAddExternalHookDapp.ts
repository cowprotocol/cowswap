import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { addExternalHookDappsAtom } from '../state/externalHookDappsAtom'
import { HookDappIframe } from '../types/hooks'

export function useAddExternalHookDapp() {
  const setAddExternalHookDapps = useSetAtom(addExternalHookDappsAtom)

  return useCallback(
    (dapp: Omit<HookDappIframe, 'isCustom'>) => {
      const customDapp: HookDappIframe = { ...dapp, isCustom: true }
      setAddExternalHookDapps(customDapp)
    },
    [setAddExternalHookDapps],
  )
}
