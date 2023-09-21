import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useAsyncMemo } from 'use-async-memo'

import { useExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'
import { useFallbackHandlerVerification } from '../hooks/useFallbackHandlerVerification'
import { ExtensibleFallbackVerification, verifyExtensibleFallback } from '../services/verifyExtensibleFallback'
import { updateFallbackHandlerVerificationAtom } from '../state/fallbackHandlerVerificationAtom'

export function FallbackHandlerVerificationUpdater() {
  const { account } = useWalletInfo()
  const update = useSetAtom(updateFallbackHandlerVerificationAtom)
  const verification = useFallbackHandlerVerification()
  const isFallbackHandlerRequired = verification !== ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER

  const extensibleFallbackContext = useExtensibleFallbackContext()
  const fallbackHandlerVerification = useAsyncMemo(
    () =>
      extensibleFallbackContext && isFallbackHandlerRequired
        ? verifyExtensibleFallback(extensibleFallbackContext)
        : null,
    [isFallbackHandlerRequired, extensibleFallbackContext],
    null
  )

  useEffect(() => {
    if (!account || fallbackHandlerVerification === null) return

    update({ [account]: fallbackHandlerVerification })
  }, [fallbackHandlerVerification, update, account])

  return null
}
