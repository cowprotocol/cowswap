import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'

import { useIsEoaTwap } from './useIsEoaTwap'

import { twapDeadlineAtom } from '../state/twapOrderAtom'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'
import { isPartSellAmountTooSmall } from '../utils/isSellAmountTooSmall'
import { getTwapCowBatchCadenceSuggestion, TwapCowBatchCadenceSuggestion } from '../utils/twapCowBatchCadence'

export function useTwapCowBatchCadenceSuggestion(
  isPartsCountAffordable: (parts: number) => boolean,
): TwapCowBatchCadenceSuggestion | null {
  const isEoaTwap = useIsEoaTwap()
  const { chainId } = useWalletInfo()
  const { inputCurrencyFiatAmount } = useAdvancedOrdersDerivedState()
  const totalDuration = useAtomValue(twapDeadlineAtom)
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)

  return useMemo(() => {
    if (!isEoaTwap) return null

    return getTwapCowBatchCadenceSuggestion({
      totalDuration,
      currentParts: numberOfPartsValue,
      isPartsCountAllowed: (parts) =>
        isPartsCountAffordable(parts) && !isPartSellAmountTooSmall(inputCurrencyFiatAmount, parts, chainId),
    })
  }, [chainId, inputCurrencyFiatAmount, isEoaTwap, isPartsCountAffordable, numberOfPartsValue, totalDuration])
}
