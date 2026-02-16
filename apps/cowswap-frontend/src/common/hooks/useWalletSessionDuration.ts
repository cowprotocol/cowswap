import { useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

export function useWalletSessionDuration(): void {
  const { account, chainId } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const cowAnalytics = useCowAnalytics()
  const startRef = useRef<number>(0)
  const walletNameRef = useRef<string | undefined>(walletName)

  useEffect(() => {
    walletNameRef.current = walletName
  }, [walletName])

  useEffect(() => {
    if (!account || !chainId) {
      return
    }

    startRef.current = Date.now()

    const sendDuration = (): void => {
      if (!startRef.current) {
        return
      }

      const durationSec = Math.round((Date.now() - startRef.current) / 1000)

      if (durationSec < 1) {
        return
      }

      cowAnalytics.sendEvent({
        category: 'Wallet',
        action: 'wallet_session_duration',
        label: walletNameRef.current || 'Unknown',
        value: durationSec,
      })
    }

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') {
        sendDuration()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      sendDuration()
    }
  }, [account, chainId, cowAnalytics])
}
