import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useAsyncMemo } from 'use-async-memo'

import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'

import { useIsSafeApp } from '../../wallet'
import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { verifyExtensibleFallback } from '../services/verifyExtensibleFallback'
import { twapOrderAtom } from '../state/twapOrderAtom'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function useTwapFormState(): TwapFormState | null {
  const isSafeApp = useIsSafeApp()
  const extensibleFallbackContext = useExtensibleFallbackContext()
  const { isFallbackHandlerSetupAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const twapOrder = useAtomValue(twapOrderAtom)

  const verification = useAsyncMemo(
    () => (extensibleFallbackContext ? verifyExtensibleFallback(extensibleFallbackContext) : null),
    [extensibleFallbackContext],
    null
  )

  return useMemo(() => {
    return getTwapFormState({ isSafeApp, isFallbackHandlerSetupAccepted, verification, twapOrder })
  }, [isSafeApp, isFallbackHandlerSetupAccepted, verification, twapOrder])
}
