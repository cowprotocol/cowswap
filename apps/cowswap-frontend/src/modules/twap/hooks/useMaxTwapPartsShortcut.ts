import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useUsdAmount } from 'modules/usdAmount'

import { DEFAULT_NUM_OF_PARTS, MINIMUM_PART_SELL_AMOUNT_FIAT } from '../const'
import { twapDeadlineAtom } from '../state/twapOrderAtom'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'
import { getMaxTwapPartsForDeadline } from '../utils/getMaxTwapPartsForDeadline'
import { getMaxTwapPartsForSellAmount } from '../utils/getMaxTwapPartsForSellAmount'

interface MaxTwapPartsShortcut {
  maxValidParts: number
  canUseMaxPartsShortcut: boolean
  useMaxPartsShortcut(): void
}

export function useMaxTwapPartsShortcut(isConfirmationModal?: boolean): MaxTwapPartsShortcut {
  const { chainId } = useWalletInfo()
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)
  const deadline = useAtomValue(twapDeadlineAtom)
  const updateTwapOrdersSettings = useSetAtom(updateTwapOrdersSettingsAtom)
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const totalSellAmountFiat = useUsdAmount(inputCurrencyAmount).value

  const maxPartsForDeadline = getMaxTwapPartsForDeadline(deadline)
  const minimumSellAmountFiat = chainId ? MINIMUM_PART_SELL_AMOUNT_FIAT[chainId] : null
  const maxPartsForSellAmount = getMaxTwapPartsForSellAmount(totalSellAmountFiat, minimumSellAmountFiat)
  const maxValidParts = Math.min(maxPartsForDeadline, maxPartsForSellAmount)
  const canUseMaxPartsShortcut =
    !isConfirmationModal && maxValidParts >= DEFAULT_NUM_OF_PARTS && maxValidParts < numberOfPartsValue

  const useMaxPartsShortcut = useCallback(() => {
    if (!canUseMaxPartsShortcut) return

    updateTwapOrdersSettings({ numberOfPartsValue: maxValidParts })
  }, [canUseMaxPartsShortcut, updateTwapOrdersSettings, maxValidParts])

  return { maxValidParts, canUseMaxPartsShortcut, useMaxPartsShortcut }
}
