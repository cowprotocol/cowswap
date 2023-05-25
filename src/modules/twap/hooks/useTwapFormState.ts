import { useAsyncMemo } from 'use-async-memo'
import { verifyExtensibleFallback } from '../services/verifyExtensibleFallback'
import { useMemo } from 'react'
import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { useIsSafeApp } from '../../wallet'
import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'
import { useAtomValue } from 'jotai'
import { twapOrderAtom } from '../state/twapOrderAtom'

export function useTwapFormState(): TwapFormState {
  const isSafeApp = useIsSafeApp()
  const extensibleFallbackContext = useExtensibleFallbackContext()

  const twapOrder = useAtomValue(twapOrderAtom)

  const verification = useAsyncMemo(
    () => (extensibleFallbackContext ? verifyExtensibleFallback(extensibleFallbackContext) : null),
    [extensibleFallbackContext],
    null
  )

  return useMemo(() => {
    return getTwapFormState({ isSafeApp, verification, twapOrder })
  }, [isSafeApp, verification, twapOrder])
}
