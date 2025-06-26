import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import { useAsyncMemo } from 'use-async-memo'

import { useExtensibleFallbackContext } from '../hooks/useExtensibleFallbackContext'
import { useFallbackHandlerVerification } from '../hooks/useFallbackHandlerVerification'
import { ExtensibleFallbackVerification, verifyExtensibleFallback } from '../services/verifyExtensibleFallback'
import { updateFallbackHandlerVerificationAtom } from '../state/fallbackHandlerVerificationAtom'

const FB_CACHE_TIME = ms`10m`
const FB_UPDATE_TIME_KEY = 'fallbackHandlerUpdateTime'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function FallbackHandlerVerificationUpdater() {
  const { account } = useWalletInfo()
  const update = useSetAtom(updateFallbackHandlerVerificationAtom)
  const verification = useFallbackHandlerVerification()
  const isFallbackHandlerRequired = verification !== ExtensibleFallbackVerification.HAS_DOMAIN_VERIFIER

  const fallbackHandlerUpdateTime = localStorage.getItem(FB_UPDATE_TIME_KEY)
  const isCacheOutdated = !fallbackHandlerUpdateTime || Date.now() - +fallbackHandlerUpdateTime > FB_CACHE_TIME

  const extensibleFallbackContext = useExtensibleFallbackContext()
  const fallbackHandlerVerification = useAsyncMemo(
    () =>
      extensibleFallbackContext && (isFallbackHandlerRequired || isCacheOutdated)
        ? verifyExtensibleFallback(extensibleFallbackContext)
        : null,
    [isFallbackHandlerRequired, isCacheOutdated, extensibleFallbackContext],
    null,
  )

  useEffect(() => {
    if (!account || fallbackHandlerVerification === null) return

    update({ [account.toLowerCase()]: fallbackHandlerVerification })
    localStorage.setItem(FB_UPDATE_TIME_KEY, Date.now().toString())
  }, [fallbackHandlerVerification, update, account])

  return null
}
