import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { RemoveHook } from '@cowprotocol/types'

import { hooksAtom } from '../state/hookDetailsAtom'

export function useRemoveHook(): RemoveHook {
  const updateHooks = useSetAtom(hooksAtom)

  return useCallback(
    (uuid, isPreHook) => {
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
    [updateHooks]
  )
}
