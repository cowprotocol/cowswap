import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { updateTwapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'
import { MIN_PARTS_NUMBER, MAX_PARTS_NUMBER } from 'legacy/constants'

export function useParseNumberOfParts() {
  const updateSettingsState = useSetAtom(updateTwapOrdersSettingsAtom)

  return useCallback(
    (value: string) => {
      const parsed = parseInt(value) || 0
      const update: { numberOfPartsValue: number; numberOfPartsError: null | string } = {
        numberOfPartsValue: parsed,
        numberOfPartsError: null,
      }

      if (parsed < MIN_PARTS_NUMBER) {
        update.numberOfPartsError = `Should be at least ${MIN_PARTS_NUMBER}`
      }

      if (parsed > MAX_PARTS_NUMBER) {
        update.numberOfPartsError = `Should be less then ${MAX_PARTS_NUMBER}`
      }

      updateSettingsState({ ...update })
    },
    [updateSettingsState]
  )
}
