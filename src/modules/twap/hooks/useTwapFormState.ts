import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useIsSafeApp, useWalletInfo } from 'modules/wallet'

import { useFallbackHandlerVerification } from './useFallbackHandlerVerification'

import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { partsStateAtom } from '../state/partsStateAtom'
import { twapOrderAtom, twapTimeIntervalAtom } from '../state/twapOrderAtom'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function useTwapFormState(): TwapFormState | null {
  const { isFallbackHandlerSetupAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const { chainId } = useWalletInfo()

  const twapOrder = useAtomValue(twapOrderAtom)
  const { inputFiatAmount: sellAmountPartFiat } = useAtomValue(partsStateAtom)
  const partTime = useAtomValue(twapTimeIntervalAtom)

  const verification = useFallbackHandlerVerification()
  const isSafeApp = useIsSafeApp()

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
