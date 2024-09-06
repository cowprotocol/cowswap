import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/index'
import { useCallback } from 'react'

import { CowHook, EditHook } from '@cowprotocol/types'

import { hooksAtom } from '../state/hookDetailsAtom'

export function useEditHook(): EditHook {
  const hooksState = useAtomValue(hooksAtom)
  const updateHooks = useSetAtom(hooksAtom)

  return useCallback(
    (uuid: string, update: CowHook, isPreHook: boolean) => {
      const type = isPreHook ? 'preHooks' : 'postHooks'
      const hookIndex = hooksState[type].findIndex((i) => i.uuid === uuid)

      if (hookIndex < 0) return

      updateHooks((state) => {
        const typeState = [...hooksState[type]]
        typeState[hookIndex] = { ...typeState[hookIndex], hook: update }

        return {
          ...state,
          [type]: typeState,
        }
      })
    },
    [updateHooks, hooksState],
  )
}
