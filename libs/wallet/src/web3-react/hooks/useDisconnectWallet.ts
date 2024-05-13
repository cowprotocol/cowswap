import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'
import { useWeb3React } from '@web3-react/core'

export function useDisconnectWallet(onDisconnect?: Command) {
  const { connector } = useWeb3React()

  return useCallback(() => {
    if (connector.deactivate) {
      connector.deactivate()
    } else {
      connector.resetState()
    }

    onDisconnect?.()
  }, [onDisconnect, connector])
}
