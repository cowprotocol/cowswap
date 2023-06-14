import { useMemo } from 'react'

import { useAsyncMemo } from 'use-async-memo'

import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'

import { useIsSafeApp } from '../../wallet'
import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { verifyExtensibleFallback } from '../services/verifyExtensibleFallback'

export function useTwapFormState(): TwapFormState | null {
  const isSafeApp = useIsSafeApp()
  const extensibleFallbackContext = useExtensibleFallbackContext()

  const verification = useAsyncMemo(
    () => (extensibleFallbackContext ? verifyExtensibleFallback(extensibleFallbackContext) : null),
    [extensibleFallbackContext],
    null
  )

  return useMemo(() => {
    return getTwapFormState({ isSafeApp, verification })
  }, [isSafeApp, verification])
}
