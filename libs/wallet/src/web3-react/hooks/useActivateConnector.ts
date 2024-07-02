import { useCallback, useMemo, useState } from 'react'

import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { Connector } from '@web3-react/types'

import { useWalletInfo } from '../../api/hooks'
import { ConnectionType } from '../../api/types'
import { getIsHardWareWallet } from '../utils/getIsHardWareWallet'
import { getWeb3ReactConnection } from '../utils/getWeb3ReactConnection'

export interface ConnectorActivationContext {
  skipNetworkChanging?: boolean

  beforeActivation(): void

  afterActivation(isHardWareWallet: boolean, connectionType: ConnectionType): void

  onActivationError(error: any): void
}

export function useActivateConnector({
  skipNetworkChanging,
  beforeActivation,
  afterActivation,
  onActivationError,
}: ConnectorActivationContext) {
  const { chainId } = useWalletInfo()
  const [pendingConnector, setPendingConnector] = useState<Connector | undefined>()

  const tryActivation = useCallback(
    async (connector: Connector) => {
      const connection = getWeb3ReactConnection(connector)
      const connectionType = connection.type
      const isHardWareWallet = getIsHardWareWallet(connectionType)

      // Skips wallet connection if the connection should override the default
      // behavior, i.e. install MetaMask or launch Coinbase app
      if (connection.overrideActivate?.(chainId)) return

      try {
        setPendingConnector(connector)
        beforeActivation()

        await connector.activate(skipNetworkChanging ? undefined : getCurrentChainIdFromUrl())

        afterActivation(isHardWareWallet, connectionType)
      } catch (error: any) {
        console.error(`[tryActivation] web3-react connection error`, error)

        onActivationError(error)
      }
    },
    [chainId, pendingConnector, skipNetworkChanging, afterActivation, beforeActivation, onActivationError]
  )

  return useMemo(
    () => ({
      tryActivation,
      retryPendingActivation: () => {
        if (pendingConnector) {
          tryActivation(pendingConnector)
        }
      },
    }),
    [tryActivation, pendingConnector]
  )
}
