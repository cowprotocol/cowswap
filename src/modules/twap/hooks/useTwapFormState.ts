import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useFallbackHandlerVerification } from './useFallbackHandlerVerification'

import { useIsSafeApp } from '../../wallet'
import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { twapOrderAtom } from '../state/twapOrderAtom'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function useTwapFormState(): TwapFormState | null {
  const { isFallbackHandlerSetupAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const twapOrder = useAtomValue(twapOrderAtom)

  const verification = useFallbackHandlerVerification()
  const isSafeApp = useIsSafeApp()

  return useMemo(() => {
    return getTwapFormState({ isSafeApp, isFallbackHandlerSetupAccepted, verification, twapOrder })
  }, [isSafeApp, isFallbackHandlerSetupAccepted, verification, twapOrder])
}
