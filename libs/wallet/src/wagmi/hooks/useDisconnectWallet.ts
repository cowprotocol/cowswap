import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'

import { useDisconnect } from 'wagmi'

export function useDisconnectWallet(onDisconnect?: Command): () => Promise<void> {
  const { mutateAsync: disconnect } = useDisconnect()

  return useCallback(async () => {
    await disconnect()

    onDisconnect?.()
  }, [disconnect, onDisconnect])
}
