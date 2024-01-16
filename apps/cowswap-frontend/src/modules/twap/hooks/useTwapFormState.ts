import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useIsSafeApp, useWalletInfo } from '@cowprotocol/wallet'

import { useFallbackHandlerVerification } from './useFallbackHandlerVerification'

import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { partsStateAtom } from '../state/partsStateAtom'
import { twapOrderAtom, twapTimeIntervalAtom } from '../state/twapOrderAtom'

export function useTwapFormState(): TwapFormState | null {
  const { chainId } = useWalletInfo()

  const twapOrder = useAtomValue(twapOrderAtom)
  const { inputFiatAmount: sellAmountPartFiat } = useAtomValue(partsStateAtom)
  const partTime = useAtomValue(twapTimeIntervalAtom)

  const verification = useFallbackHandlerVerification()
  const isSafeApp = useIsSafeApp()

  return useMemo(() => {
    return getTwapFormState({
      isSafeApp,
      verification,
      twapOrder,
      sellAmountPartFiat,
      chainId,
      partTime,
    })
  }, [isSafeApp, verification, twapOrder, sellAmountPartFiat, chainId, partTime])
}
