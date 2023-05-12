import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { updateAdvancedOrdersSettingsAtom } from '@cow/modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { DeadlinePayload } from '../types'

export function useUpdateDeadline() {
  const updateState = useSetAtom(updateAdvancedOrdersSettingsAtom)

  return useCallback(
    (payload: DeadlinePayload) => {
      const { isCustomDeadline, customDeadline, deadline } = payload
      const update: DeadlinePayload = { isCustomDeadline }

      if (isCustomDeadline) {
        update.customDeadline = customDeadline
      } else {
        update.deadline = deadline
      }

      updateState(update)
    },
    [updateState]
  )
}
