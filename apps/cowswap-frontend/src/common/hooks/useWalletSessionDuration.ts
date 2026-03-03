import { useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

const MIN_SESSION_DURATION_MS = 5_000

/**
 * Tracks visible engagement while a wallet is connected.
 *
 * Duration is accumulated only while `document.visibilityState === 'visible'`.
 * Hidden intervals are paused and excluded from `wallet_session_duration`.
 *
 * Checkpoints are flushed on:
 * 1. `visibilitychange` — fires when the tab goes hidden (tab switch, minimize).
 * 2. Effect cleanup — fires on unmount (wallet disconnect, chain change, navigation).
 *
 * Each flush sends a visible-time delta checkpoint when it reaches the minimum threshold.
 */
export function useWalletSessionDuration(): void {
  const { account, chainId } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const cowAnalytics = useCowAnalytics()
  const visibleStartRef = useRef<number | null>(null)
  const accumulatedVisibleMsRef = useRef<number>(0)
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

    visibleStartRef.current = document.visibilityState === 'visible' ? Date.now() : null
    accumulatedVisibleMsRef.current = 0

    const pauseVisibleTracking = (): void => {
      if (visibleStartRef.current === null) {
        return
      }

      accumulatedVisibleMsRef.current += Date.now() - visibleStartRef.current
      visibleStartRef.current = null
    }

    const resumeVisibleTracking = (): void => {
      if (document.visibilityState !== 'visible' || visibleStartRef.current !== null) {
        return
      }

      visibleStartRef.current = Date.now()
    }

    const sendDuration = (): boolean => {
      const elapsedMs = accumulatedVisibleMsRef.current

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

      accumulatedVisibleMsRef.current = 0
      return true
    }

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') {
        pauseVisibleTracking()
        sendDuration()
        return
      }

      resumeVisibleTracking()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      pauseVisibleTracking()
      sendDuration()
      visibleStartRef.current = null
      accumulatedVisibleMsRef.current = 0
    }
  }, [account, chainId, cowAnalytics])
}
