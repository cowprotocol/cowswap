import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'
import { useDisconnect } from '@reown/appkit/react'

export function useDisconnectWallet(onDisconnect?: Command) {
  const { disconnect } = useDisconnect()

  return useCallback(() => {
    disconnect().then(onDisconnect)
  }, [disconnect])
}
