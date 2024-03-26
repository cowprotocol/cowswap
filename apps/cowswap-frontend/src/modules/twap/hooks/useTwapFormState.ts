import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useIsSafeApp } from '@cowprotocol/wallet'

import { useFallbackHandlerVerification } from './useFallbackHandlerVerification'

import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { twapTimeIntervalAtom } from '../state/twapOrderAtom'

export function useTwapFormState(): TwapFormState | null {
  const partTime = useAtomValue(twapTimeIntervalAtom)

  const verification = useFallbackHandlerVerification()
  const isSafeApp = useIsSafeApp()

  return useMemo(() => {
    return getTwapFormState({
      isSafeApp,
      verification,
      partTime,
    })
  }, [isSafeApp, verification, partTime])
}
