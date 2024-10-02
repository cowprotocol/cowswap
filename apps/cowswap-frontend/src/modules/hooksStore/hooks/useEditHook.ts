import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'

import { setHooksAtom } from '../state/hookDetailsAtom'
import { EditHook } from '../types/hooks'
import { appendDappIdToCallData } from '../utils'

export function useEditHook(isPreHook: boolean): EditHook {
  const updateHooks = useSetAtom(setHooksAtom)

  return useCallback(
    (update: CowHookDetails) => {
      updateHooks((state) => {
        const type = isPreHook ? 'preHooks' : 'postHooks'
        const hookIndex = state[type].findIndex((i) => i.hookDetails.uuid === update.uuid)

        if (hookIndex < 0) return state

        const typeState = [...state[type]]
        const hookDetails = typeState[hookIndex]

        typeState[hookIndex] = {
          ...hookDetails,
          hookDetails: {
            ...update,
            hook: {
              ...update.hook,
              callData: appendDappIdToCallData(update.hook.callData, hookDetails.dappId),
            },
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
