import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { v4 as uuidv4 } from 'uuid'

import { setHooksAtom } from '../state/hookDetailsAtom'
import { AddHook, CowHookDetailsSerialized, HookDapp } from '../types/hooks'
import { appendDappIdToCallData } from '../utils'

export function useAddHook(dapp: HookDapp, isPreHook: boolean): AddHook {
  const updateHooks = useSetAtom(setHooksAtom)

  return useCallback(
    (hookToAdd) => {
      console.log('[hooks] Add ' + (isPreHook ? 'pre-hook' : 'post-hook'), hookToAdd, isPreHook)

      const uuid = uuidv4()
      const hookDetails: CowHookDetailsSerialized = {
        hookDetails: {
          ...hookToAdd,
          uuid,
          hook: {
            ...hookToAdd.hook,
            callData: appendDappIdToCallData(hookToAdd.hook.callData, dapp.id),
          },
        },
        dappId: dapp.id,
      }

      updateHooks((hooks) => {
        if (isPreHook) {
          return { preHooks: [...hooks.preHooks, hookDetails], postHooks: hooks.postHooks }
        } else {
          return { preHooks: hooks.preHooks, postHooks: [...hooks.postHooks, hookDetails] }
        }
      })
    },
    [updateHooks, dapp],
  )
}
