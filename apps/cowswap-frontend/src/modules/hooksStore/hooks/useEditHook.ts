import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { CowHook, EditHook } from '@cowprotocol/types'

import { setHooksAtom } from '../state/hookDetailsAtom'

export function useEditHook(): EditHook {
  const updateHooks = useSetAtom(setHooksAtom)

  return useCallback(
    (uuid: string, update: CowHook, isPreHook: boolean) => {
      updateHooks((state) => {
        const type = isPreHook ? 'preHooks' : 'postHooks'
        const hookIndex = state[type].findIndex((i) => i.uuid === uuid)

        if (hookIndex < 0) return state

        const typeState = [...state[type]]
        typeState[hookIndex] = { ...typeState[hookIndex], hook: update }

        return {
          ...state,
          [type]: typeState,
        }
      })
    },
    [updateHooks],
  )
}
