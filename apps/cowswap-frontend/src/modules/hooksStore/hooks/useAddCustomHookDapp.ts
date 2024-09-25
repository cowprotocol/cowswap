import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { addCustomHookDappAtom } from '../state/customHookDappsAtom'
import { HookDappIframe } from '../types/hooks'

export function useAddCustomHookDapp(isPreHook: boolean) {
  const setState = useSetAtom(addCustomHookDappAtom)

  return useCallback(
    (dapp: HookDappIframe) => {
      return setState(isPreHook, dapp)
    },
    [setState, isPreHook],
  )
}
