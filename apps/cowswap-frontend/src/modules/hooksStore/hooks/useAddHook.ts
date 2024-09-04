import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { AddHook, HookDapp } from '@cowprotocol/types'

import { v4 as uuidv4 } from 'uuid'

import { hooksAtom } from '../state/hookDetailsAtom'

export function useAddHook(dapp: HookDapp, isPreHook: boolean): AddHook {
  const updateHooks = useSetAtom(hooksAtom)

  return useCallback(
    (hookToAdd) => {
      console.log('[hooks] Add ' + (isPreHook ? 'pre-hook' : 'post-hook'), hookToAdd, isPreHook)

      const uuid = uuidv4()
      const hookDetails = { ...hookToAdd, uuid, dapp }

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
