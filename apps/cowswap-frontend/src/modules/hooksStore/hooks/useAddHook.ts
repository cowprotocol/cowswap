import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { AddHook } from '@cowprotocol/types'

import { v4 as uuidv4 } from 'uuid'

import { hooksAtom } from '../state/hookDetailsAtom'

export function useAddHook(): AddHook {
  const updateHooks = useSetAtom(hooksAtom)

  return useCallback(
    (hookToAdd, isPreHook) => {
      console.log('[hooks] Add ' + (isPreHook ? 'pre-hook' : 'post-hook'), hookToAdd, isPreHook)
      const uuid = uuidv4()
      const hookDetails = { ...hookToAdd, uuid }
      updateHooks((hooks) => {
        if (isPreHook) {
          return { ...hooks, preHooks: [...hooks.preHooks, hookDetails] }
        } else {
          return { ...hooks, postHooks: [...hooks.postHooks, hookDetails] }
        }
      })

      return hookDetails
    },
    [updateHooks]
  )
}
