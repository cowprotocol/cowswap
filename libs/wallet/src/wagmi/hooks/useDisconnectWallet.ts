import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'

import { useDisconnect } from 'wagmi'

import { useSetEip6963Provider } from '../../api/hooks'

export function useDisconnectWallet(onDisconnect?: Command): () => Promise<void> {
  const { mutateAsync: wagmiDisconnect } = useDisconnect()
  const setEip6963Provider = useSetEip6963Provider()

  return useCallback(async () => {
    await wagmiDisconnect()

    // Clear the persisted EIP-6963 provider to prevent any reconnection attempts
    setEip6963Provider(null)

    onDisconnect?.()
  }, [wagmiDisconnect, setEip6963Provider, onDisconnect])
}
