import { useMemo } from 'react'

import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { ConnectionType } from '../../api/types'
import { getWeb3ReactConnection } from '../utils/getWeb3ReactConnection'

export function useIsWalletConnect(): boolean {
  const { connector } = useWeb3React()

  return useMemo(() => {
    return getIsWalletConnect(connector)
  }, [connector])
}

export function getIsWalletConnect(connector: Connector): boolean {
  const connection = getWeb3ReactConnection(connector)

  return ConnectionType.WALLET_CONNECT_V2 === connection.type
}
