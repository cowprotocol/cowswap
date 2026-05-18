import { useSyncExternalStore } from 'react'

import { useConnection } from 'wagmi'

import { useWalletInfo } from '../../api/hooks'
import { config } from '../config'

function getCurrentConnectorUid(): string | null {
  return config.state.current ?? null
}

function subscribeToCurrentConnectorUid(callback: () => void): () => void {
  return config.subscribe((state) => state.current, callback)
}

export function useIsRestoringConnection(): boolean {
  const { status } = useConnection()
  const { account } = useWalletInfo()

  const currentConnectorUid = useSyncExternalStore(subscribeToCurrentConnectorUid, getCurrentConnectorUid, () => null)

  if (status === 'reconnecting') return true
  if (status === 'connected' && !account) return true
  if (!!currentConnectorUid && !account) return true

  return false
}
