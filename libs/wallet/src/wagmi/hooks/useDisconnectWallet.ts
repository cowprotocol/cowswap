import { useCallback } from 'react'

import { useDisconnect } from 'wagmi'

import { Command } from '@cowprotocol/types'

import { USER_DISCONNECTED_SESSION_KEY } from '../../constants'

export function useDisconnectWallet(onDisconnect?: Command): () => Promise<void> {
  const { mutateAsync: wagmiDisconnect } = useDisconnect()

  return useCallback(async () => {
    await wagmiDisconnect()

    // Prevent InjectedBrowserAutoConnect from reopening the wallet (e.g. Rabby) right after disconnect
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(USER_DISCONNECTED_SESSION_KEY, '1')
    }

    onDisconnect?.()
  }, [wagmiDisconnect, onDisconnect])
}
