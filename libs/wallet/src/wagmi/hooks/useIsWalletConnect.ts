import { useMemo } from 'react'

import { Connector, useConnection } from 'wagmi'

import { ConnectionType } from '../../api/types'

export function useIsWalletConnect(): boolean {
  const { connector } = useConnection()

  return useMemo(() => {
    return getIsWalletConnect(connector)
  }, [connector])
}

// TODO remove in M-7 COW-572
function isConnector(connector?: Connector): connector is Connector {
  return !!connector && 'type' in connector
}

// TODO update type on M-7 COW-572
export function getIsWalletConnect(connector?: Connector): boolean {
  if (!isConnector(connector)) {
    return false
  }
  return connector?.type === ConnectionType.WALLET_CONNECT_V2
}
