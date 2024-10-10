import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { CowHookToEdit } from '@cowprotocol/hook-dapp-lib'

import { setHooksAtom } from '../state/hookDetailsAtom'
import { EditHook } from '../types/hooks'

export function useEditHook(isPreHook: boolean): EditHook {
  const updateHooks = useSetAtom(setHooksAtom)

  return useCallback(
    (update: CowHookToEdit) => {
      updateHooks((state) => {
        const type = isPreHook ? 'preHooks' : 'postHooks'
        const hookIndex = state[type].findIndex((i) => i.uuid === update.uuid)

        if (hookIndex < 0) return state

        const typeState = [...state[type]]
        const hookDetails = typeState[hookIndex]

        typeState[hookIndex] = {
          ...hookDetails,
          ...update,
          hook: {
            ...update.hook,
            dappId: hookDetails.hook.dappId,
          },
        }

        return {
          ...state,
          [type]: typeState,
        }
      })
    },
    [updateHooks, isPreHook],
  )
}
