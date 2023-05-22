import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { updateAdvancedOrdersSettingsAtom } from 'modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { DeadlinePayload } from '../types'
import { useDeadline } from './useDeadline'

export function useUpdateDeadline() {
  const updateState = useSetAtom(updateAdvancedOrdersSettingsAtom)
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
