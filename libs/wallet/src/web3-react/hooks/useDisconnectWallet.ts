import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'
import { useWeb3React } from '@web3-react/core'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
