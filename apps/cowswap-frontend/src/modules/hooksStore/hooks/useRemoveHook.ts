import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { setHooksAtom } from '../state/hookDetailsAtom'
import { RemoveHook } from '../types/hooks'

export function useRemoveHook(isPreHook: boolean): RemoveHook {
  const updateHooks = useSetAtom(setHooksAtom)

  return useCallback(
    (uuid) => {
      console.log('[hooks] Remove ' + (isPreHook ? 'pre-hook' : 'post-hook'), uuid, isPreHook)

      updateHooks((hooks) => {
        if (isPreHook) {
          return {
            preHooks: hooks.preHooks.filter((hook) => hook.uuid !== uuid),
            postHooks: hooks.postHooks,
          }
        } else {
          return {
            preHooks: hooks.preHooks,
            postHooks: hooks.postHooks.filter((hook) => hook.uuid !== uuid),
          }
        }
      })
    },
    [updateHooks, isPreHook],
  )
}
