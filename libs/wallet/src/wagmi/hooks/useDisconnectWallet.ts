import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'

import { reownAppKit } from '../config'

export function useDisconnectWallet(onDisconnect?: Command): () => Promise<void> {
  return useCallback(async () => {
    await reownAppKit.disconnect()

    onDisconnect?.()
  }, [onDisconnect])
}
