import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import {
  updateAdvancedOrdersSettingsAtom,
  NumberOfPartsError,
} from '@cow/modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { MIN_PARTS_NUMBER, MAX_PARTS_NUMBER } from '@src/constants'

export function useParseNumberOfParts() {
  const updateSettingsState = useSetAtom(updateAdvancedOrdersSettingsAtom)

  return useCallback(
    (value: string) => {
      const parsed = parseInt(value) || 0

      updateSettingsState({ numberOfParts: parsed, numberOfPartsError: null })

      if (parsed < MIN_PARTS_NUMBER || parsed > MAX_PARTS_NUMBER) {
        updateSettingsState({ numberOfPartsError: NumberOfPartsError.InvalidInput })
      }
    },
    [updateSettingsState]
  )
}
