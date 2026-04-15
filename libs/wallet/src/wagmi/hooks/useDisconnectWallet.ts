import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'

import { useDisconnect } from 'wagmi'

import { useSetEip6963Provider } from '../../api/hooks'
import { USER_DISCONNECTED_SESSION_KEY } from '../../constants'

export function useDisconnectWallet(onDisconnect?: Command): () => Promise<void> {
  const { mutateAsync: wagmiDisconnect } = useDisconnect()
  const setEip6963Provider = useSetEip6963Provider()

  return useCallback(async () => {
    await wagmiDisconnect()

    // Clear the persisted EIP-6963 provider to prevent any reconnection attempts
    setEip6963Provider(null)

    // Prevent InjectedBrowserAutoConnect from reopening the wallet (e.g. Rabby) right after disconnect
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(USER_DISCONNECTED_SESSION_KEY, '1')
    }

    onDisconnect?.()
  }, [wagmiDisconnect, setEip6963Provider, onDisconnect])
}
