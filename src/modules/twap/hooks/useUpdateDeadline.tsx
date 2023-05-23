import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { DeadlinePayload } from '../pure/DeadlineSelector/types'
import { useDeadline } from './useDeadline'
import { updateTwapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function useUpdateDeadline() {
  const updateState = useSetAtom(updateTwapOrdersSettingsAtom)
  const prevState = useDeadline()

  return useCallback(
    (payload: DeadlinePayload) => {
      const { isCustomDeadline, customDeadline, deadline } = payload
      const update: DeadlinePayload = { isCustomDeadline }

      if (isCustomDeadline) {
        update.customDeadline = customDeadline
      } else {
        update.deadline = deadline
      }

      updateState({ ...prevState, ...update })
    },
    [updateState, prevState]
  )
}
