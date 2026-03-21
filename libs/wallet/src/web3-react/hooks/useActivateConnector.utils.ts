import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Connector } from '@web3-react/types'

import { ConnectionType } from '../../api/types'
import { getWalletConnectV2Connection, resetWalletConnectV2Connection } from '../connection/walletConnectV2.utils'
import { getWeb3ReactConnection } from '../utils/getWeb3ReactConnection'

type WalletConnectConnectorLike = Connector & {
  deactivate?(): Promise<void> | void
  provider?: {
    session?: Record<string, unknown>
  }
}

export interface PendingConnection {
  connectionType: ConnectionType
  walletConnectChainId?: SupportedChainId
}

export function getPendingConnection(
  connectionType: ConnectionType,
  walletConnectChainId: SupportedChainId,
): PendingConnection {
  if (connectionType === ConnectionType.WALLET_CONNECT_V2) {
    return { connectionType, walletConnectChainId }
  }

  return { connectionType }
}

export function getRetryConnector(pendingConnection: PendingConnection): Connector {
  if (pendingConnection.connectionType === ConnectionType.WALLET_CONNECT_V2 && pendingConnection.walletConnectChainId) {
    return getWalletConnectV2Connection(pendingConnection.walletConnectChainId).connector
  }

  return getWeb3ReactConnection(pendingConnection.connectionType).connector
}

export async function cleanupActivationError(
  connector: Connector,
  pendingConnection: PendingConnection,
): Promise<void> {
  const walletConnectConnector = connector as WalletConnectConnectorLike

  if (
    pendingConnection.connectionType === ConnectionType.WALLET_CONNECT_V2 &&
    !walletConnectConnector.provider?.session &&
    pendingConnection.walletConnectChainId
  ) {
    await walletConnectConnector.deactivate?.()
    resetWalletConnectV2Connection(pendingConnection.walletConnectChainId)
  }
}
