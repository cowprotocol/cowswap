import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { upsertCustomHookDappAtom } from '../state/customHookDappsAtom'
import { HookDappIframe } from '../types/hooks'

export function useAddCustomHookDapp(isPreHook: boolean) {
  const setState = useSetAtom(upsertCustomHookDappAtom)

  return useCallback(
    (dapp: HookDappIframe) => {
      return setState(isPreHook, dapp)
    },
    [setState, isPreHook],
  )
}
