import { useMemo } from 'react'

import { Connector as LegacyConnector } from '@web3-react/types'

import { Connector, useConnection } from 'wagmi'

import { ConnectorType } from '../../api/types'

export function useIsWalletConnect(): boolean {
  const { connector } = useConnection()

  return useMemo(() => {
    return getIsWalletConnect(connector)
  }, [connector])
}

// TODO remove in M-7 COW-572
function isConnector(connector?: LegacyConnector | Connector): connector is Connector {
  return !!connector && 'type' in connector
}

// TODO update type on M-7 COW-572
export function getIsWalletConnect(connector?: LegacyConnector | Connector): boolean {
  if (!isConnector(connector)) {
    return false
  }
  return connector?.type === ConnectorType.WALLET_CONNECT_V2
}
