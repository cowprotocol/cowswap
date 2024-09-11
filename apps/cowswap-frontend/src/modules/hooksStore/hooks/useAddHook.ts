import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { AddHook, CowHookDetailsSerialized, HookDapp, HookDappBase } from '../types/hooks'

import { v4 as uuidv4 } from 'uuid'

import { setHooksAtom } from '../state/hookDetailsAtom'
import { isHookDappIframe } from '../utils'

export function useAddHook(dapp: HookDapp, isPreHook: boolean): AddHook {
  const updateHooks = useSetAtom(setHooksAtom)

  return useCallback(
    (hookToAdd) => {
      console.log('[hooks] Add ' + (isPreHook ? 'pre-hook' : 'post-hook'), hookToAdd, isPreHook)

      const uuid = uuidv4()
      const hookDetails: CowHookDetailsSerialized = { ...hookToAdd, uuid, dapp: serializeHookDapp(dapp) }

      updateHooks((hooks) => {
        if (isPreHook) {
          return { preHooks: [...hooks.preHooks, hookDetails], postHooks: hooks.postHooks }
        } else {
          return { preHooks: hooks.preHooks, postHooks: [...hooks.postHooks, hookDetails] }
        }
      })

      return hookDetails
    },
    [updateHooks, dapp],
  )
}

function serializeHookDapp(dapp: HookDapp): HookDappBase {
  if (isHookDappIframe(dapp)) {
    const { url: _, ...rest } = dapp
    return rest
  }

  const { component: _, ...rest } = dapp
  return rest
}
