import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { v4 as uuidv4 } from 'uuid'

import { hooksDetailsAtom } from '../state/hookDetailsAtom'
import { CowHookCreation, CowHookDetails } from '../types'

export function useAddHook() {
  const updateHooks = useSetAtom(hooksDetailsAtom)

  return useCallback(
    (hookToAdd: CowHookCreation, isPreHook: boolean) => {
      console.log('[hooks] Add ' + (isPreHook ? 'pre-hook' : 'post-hook'), hookToAdd, isPreHook)
      const uuid = uuidv4()
      updateHooks((hooks) => {
        if (isPreHook) {
          return { preHooks: [...hooks.preHooks, { ...hookToAdd, uuid }], postHooks: hooks.postHooks }
        } else {
          return { preHooks: hooks.preHooks, postHooks: [...hooks.postHooks, { ...hookToAdd, uuid }] }
        }
      })
    },
    [updateHooks]
  )
}

export function useRemoveHook() {
  const updateHooks = useSetAtom(hooksDetailsAtom)

  return useCallback(
    (hookToRemove: CowHookDetails, isPreHook: boolean) => {
      console.log('[hooks] Remove ' + (isPreHook ? 'pre-hook' : 'post-hook'), hookToRemove, isPreHook)

      updateHooks((hooks) => {
        if (isPreHook) {
          return {
            preHooks: hooks.preHooks.filter((hook) => hook.uuid !== hookToRemove.uuid),
            postHooks: hooks.postHooks,
          }
        } else {
          return {
            preHooks: hooks.preHooks,
            postHooks: hooks.postHooks.filter((hook) => hook.uuid !== hookToRemove.uuid),
          }
        }
      })
    },
    [updateHooks]
  )
}
