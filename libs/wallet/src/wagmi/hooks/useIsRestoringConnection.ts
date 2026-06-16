import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'

import { useAppKitState } from '@reown/appkit/react'
import ms from 'ms.macro'
import { useConnection } from 'wagmi'

import { useWalletInfo } from '../../api/hooks'
import { appWalletContextAtom } from '../../state/appWalletContext.atom'

const RESTORING_CONNECTION_TIMEOUT = ms`1s`

export function useIsRestoringConnection(): boolean {
  const isRestoring = useIsRestoringConnectionRaw()

  // Don't allow the restoring state to last longer than the timeout,
  // because wallets can not answer on connection request
  // and the UI can can get stuck waiting for a connection that never resolves.
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!isRestoring) {
      setTimedOut(false)
      return
    }

    const timer = setTimeout(() => setTimedOut(true), RESTORING_CONNECTION_TIMEOUT)

    return () => clearTimeout(timer)
  }, [isRestoring])

  return isRestoring && !timedOut
}

function useIsRestoringConnectionRaw(): boolean {
  const appWalletContext = useAtomValue(appWalletContextAtom)
  const { status } = useConnection()
  const { account } = useWalletInfo()
  const state = useAppKitState()
  const { loading, initialized } = state

  const isWidgetDappMode = appWalletContext?.standaloneMode === false

  // In widget with Dapp Mode we use the widget connected which doesn't answer on accounts request
  // So we don't consider it's as reconnecting at all, because otherwise it will be stuck in that state
  if (isWidgetDappMode) return false
  if (loading || !initialized) return true
  if (status === 'reconnecting') return true

  return status === 'connected' && !account
}
