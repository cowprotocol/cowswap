import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'

import { useDisconnect } from '@reown/appkit/react'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDisconnectWallet(onDisconnect?: Command) {
  const { disconnect } = useDisconnect()

  return useCallback(async () => {
    await disconnect()

    onDisconnect?.()
  }, [disconnect, onDisconnect])
}
