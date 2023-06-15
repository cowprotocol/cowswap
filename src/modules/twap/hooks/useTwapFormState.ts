import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useAsyncMemo } from 'use-async-memo'

import { useIsSafeApp, useWalletInfo } from 'modules/wallet'

import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'

import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { verifyExtensibleFallback } from '../services/verifyExtensibleFallback'
import { partsStateAtom } from '../state/partsStateAtom'
import { twapOrderAtom, twapTimeIntervalAtom } from '../state/twapOrderAtom'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function useTwapFormState(): TwapFormState | null {
  const isSafeApp = useIsSafeApp()
  const extensibleFallbackContext = useExtensibleFallbackContext()
  const { isFallbackHandlerSetupAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const { chainId } = useWalletInfo()

  const twapOrder = useAtomValue(twapOrderAtom)
  const { inputFiatAmount: sellAmountPartFiat } = useAtomValue(partsStateAtom)
  const partTime = useAtomValue(twapTimeIntervalAtom)

  const verification = useAsyncMemo(
    () => (extensibleFallbackContext ? verifyExtensibleFallback(extensibleFallbackContext) : null),
    [extensibleFallbackContext],
    null
  )

  return useMemo(() => {
    return getTwapFormState({
      isSafeApp,
      isFallbackHandlerSetupAccepted,
      verification,
      twapOrder,
      sellAmountPartFiat,
      chainId,
      partTime,
    })
  }, [isSafeApp, isFallbackHandlerSetupAccepted, verification, twapOrder, sellAmountPartFiat, chainId, partTime])
}
