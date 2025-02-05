import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'
import { verifyExtensibleFallback } from '../services/verifyExtensibleFallback'
import { updateFallbackHandlerVerificationAtom } from '../state/fallbackHandlerVerificationAtom'

export function FallbackHandlerVerificationUpdater2() {
  const { account } = useWalletInfo()
  const updateFallbackHandlerVerification = useSetAtom(updateFallbackHandlerVerificationAtom)

  const extensibleFallbackContext = useExtensibleFallbackContext()

  useEffect(() => {
    if (!extensibleFallbackContext || !account) return

    verifyExtensibleFallback(extensibleFallbackContext).then((result) => {
      updateFallbackHandlerVerification({ [account]: result })
    })
  }, [account, extensibleFallbackContext, updateFallbackHandlerVerification])

  return null
}
