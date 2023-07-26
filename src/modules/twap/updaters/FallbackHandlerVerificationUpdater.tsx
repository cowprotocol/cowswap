import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useAsyncMemo } from 'use-async-memo'

import { useWalletInfo } from 'modules/wallet'

import { useExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'
import { useFallbackHandlerVerification } from '../hooks/useFallbackHandlerVerification'
import { verifyExtensibleFallback } from '../services/verifyExtensibleFallback'
import { updateFallbackHandlerVerificationAtom } from '../state/fallbackHandlerVerificationAtom'

export function FallbackHandlerVerificationUpdater() {
  const { account } = useWalletInfo()
  const update = useSetAtom(updateFallbackHandlerVerificationAtom)
  const currentWalletVerification = useFallbackHandlerVerification()

  const extensibleFallbackContext = useExtensibleFallbackContext()
  const fallbackHandlerVerification = useAsyncMemo(
    () =>
      extensibleFallbackContext && !currentWalletVerification
        ? verifyExtensibleFallback(extensibleFallbackContext)
        : null,
    [currentWalletVerification, extensibleFallbackContext],
    null
  )

  useEffect(() => {
    if (!account || fallbackHandlerVerification === null) return

    update({ [account]: fallbackHandlerVerification })
  }, [fallbackHandlerVerification, update, account])

  return null
}
