import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useIsEoaTwap } from './useIsEoaTwap'

import { twapDeadlineAtom } from '../state/twapOrderAtom'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'
import { getTwapCowBatchCadenceSuggestion, TwapCowBatchCadenceSuggestion } from '../utils/twapCowBatchCadence'

export function useTwapCowBatchCadenceSuggestion(
  isPartsCountAffordable: (parts: number) => boolean,
): TwapCowBatchCadenceSuggestion | null {
  const isEoaTwap = useIsEoaTwap()
  const totalDuration = useAtomValue(twapDeadlineAtom)
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)

  return useMemo(() => {
    if (!isEoaTwap) return null

    return getTwapCowBatchCadenceSuggestion({
      totalDuration,
      currentParts: numberOfPartsValue,
      isPartsCountAllowed: isPartsCountAffordable,
    })
  }, [isEoaTwap, isPartsCountAffordable, numberOfPartsValue, totalDuration])
}
