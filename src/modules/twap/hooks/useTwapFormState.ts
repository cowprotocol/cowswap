import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useAsyncMemo } from 'use-async-memo'

import { useIsSafeApp, useWalletInfo } from 'modules/wallet'

import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'

import { useAdvancedOrdersDerivedState } from '../../advancedOrders'
import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { verifyExtensibleFallback } from '../services/verifyExtensibleFallback'
import { twapOrderAtom } from '../state/twapOrderAtom'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function useTwapFormState(): TwapFormState | null {
  const isSafeApp = useIsSafeApp()
  const extensibleFallbackContext = useExtensibleFallbackContext()
  const { isFallbackHandlerSetupAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const { chainId } = useWalletInfo()

  const twapOrder = useAtomValue(twapOrderAtom)
  const { inputCurrencyFiatAmount } = useAdvancedOrdersDerivedState()

  const verification = useAsyncMemo(
    () => (extensibleFallbackContext ? verifyExtensibleFallback(extensibleFallbackContext) : null),
    [extensibleFallbackContext],
    null
  )

  const sellAmountPartFiat = useMemo(() => {
    if (!inputCurrencyFiatAmount || !twapOrder?.numOfParts) {
      return null
    }
    return inputCurrencyFiatAmount.divide(twapOrder.numOfParts)
  }, [inputCurrencyFiatAmount, twapOrder?.numOfParts])

  return useMemo(() => {
    return getTwapFormState({ isSafeApp, isFallbackHandlerSetupAccepted, verification, twapOrder, sellAmountPartFiat, chainId })
  }, [isSafeApp, isFallbackHandlerSetupAccepted, verification, twapOrder, sellAmountPartFiat, chainId])
}
