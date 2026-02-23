import { useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

const MIN_SESSION_DURATION_MS = 5_000

/**
 * Tracks how long a wallet stays connected on a visible page.
 *
 * Session duration is captured via two triggers:
 * 1. `visibilitychange` — fires when the tab goes hidden (tab switch, minimize).
 *    Short interruptions (< MIN_SESSION_DURATION_MS) are filtered out.
 * 2. Effect cleanup — fires on unmount (wallet disconnect, chain change, navigation).
 *
 * Each trigger sends a delta checkpoint, not cumulative time.
 */
export function useWalletSessionDuration(): void {
  const { account, chainId } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const cowAnalytics = useCowAnalytics()
  const startRef = useRef<number>(0)
  const walletNameRef = useRef<string | undefined>(walletName)

  // Sync walletNameRef via useEffect so that cleanup of the *previous* effect
  // still sees the last connected wallet name (not undefined on disconnect).
  useEffect(() => {
    walletNameRef.current = walletName
  }, [walletName])

  useEffect(() => {
    if (!account || !chainId) {
      return
    }

    startRef.current = Date.now()

    const sendDuration = (): boolean => {
      if (!startRef.current) {
        return false
      }

      const elapsedMs = Date.now() - startRef.current

      if (elapsedMs < MIN_SESSION_DURATION_MS) {
        return false
      }

      const durationSec = Math.round(elapsedMs / 1000)

      cowAnalytics.sendEvent({
        category: 'Wallet',
        action: 'wallet_session_duration',
        label: walletNameRef.current || 'Unknown',
        value: durationSec,
        chainId,
      })

      return true
    }

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') {
        const didSend = sendDuration()

        // Use delta checkpoints across hide cycles instead of cumulative values from the initial connect time.
        if (didSend) {
          startRef.current = Date.now()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      sendDuration()
    }
  }, [account, chainId, cowAnalytics])
}
