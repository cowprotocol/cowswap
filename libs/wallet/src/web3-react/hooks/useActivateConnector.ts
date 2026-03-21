import { useCallback, useMemo, useState } from 'react'

import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { Connector } from '@web3-react/types'

import {
  getActivationAttempt,
  cleanupActivationError,
  getRetryConnector,
  PendingConnection,
} from './useActivateConnector.utils'

import { useWalletInfo } from '../../api/hooks'
import { ConnectionType } from '../../api/types'
import { getIsHardWareWallet } from '../utils/getIsHardWareWallet'
import { getWeb3ReactConnection } from '../utils/getWeb3ReactConnection'

export interface ConnectorActivationContext {
  skipNetworkChanging?: boolean

  beforeActivation(): void

  afterActivation(isHardWareWallet: boolean, connectionType: ConnectionType): void

  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onActivationError(error: any): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useActivateConnector({
  skipNetworkChanging,
  beforeActivation,
  afterActivation,
  onActivationError,
}: ConnectorActivationContext) {
  const { chainId } = useWalletInfo()
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | undefined>()

  const tryActivation = useCallback(
    async (connector: Connector, retryPendingConnection?: PendingConnection) => {
      const currentChainId = getCurrentChainIdFromUrl()
      const connection = getWeb3ReactConnection(connector)
      const connectionType = connection.type
      const isHardWareWallet = getIsHardWareWallet(connectionType)
      const { activationChainId, pendingConnection: nextPendingConnection } = getActivationAttempt(
        connectionType,
        currentChainId,
        retryPendingConnection,
      )

      // Skips wallet connection if the connection should override the default
      // behavior, i.e. install MetaMask or launch Coinbase app
      if (connection.overrideActivate?.(chainId)) return

      try {
        setPendingConnection(nextPendingConnection)
        beforeActivation()

        await connector.activate(skipNetworkChanging ? undefined : activationChainId)

        afterActivation(isHardWareWallet, connectionType)
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        await cleanupActivationError(connector, nextPendingConnection)

        console.error(`[tryActivation] web3-react connection error`, error)

        onActivationError(error)
      }
    },
    [chainId, skipNetworkChanging, afterActivation, beforeActivation, onActivationError],
  )

  return useMemo(
    () => ({
      tryActivation,
      retryPendingActivation: () => {
        if (pendingConnection) {
          return tryActivation(getRetryConnector(pendingConnection), pendingConnection)
        }

        return undefined
      },
    }),
    [tryActivation, pendingConnection],
  )
}
