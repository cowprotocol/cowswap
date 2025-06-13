import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { upsertCustomHookDappAtom } from '../state/customHookDappsAtom'
import { HookDappIframe } from '../types/hooks'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAddCustomHookDapp(isPreHook: boolean) {
  const setState = useSetAtom(upsertCustomHookDappAtom)

  return useCallback(
    (dapp: HookDappIframe) => {
      return setState(isPreHook, dapp)
    },
    [setState, isPreHook],
  )
}
