import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { Connector } from '@web3-react/types'

import { ConnectionType } from '../../api/types'
import { coinbaseWalletConnection } from '../connection/coinbase'
import { injectedWalletConnection } from '../connection/injectedWallet'
import { metaMaskSdkConnection } from '../connection/metaMaskSdk'
import { networkConnection } from '../connection/network'
import { gnosisSafeConnection } from '../connection/safe'
import { trezorConnection } from '../connection/trezor'
import { getWalletConnectV2Connection } from '../connection/walletConnectV2'
import { WalletConnectV2Connector } from '../connectors/WalletConnectV2Connector'
import { Web3ReactConnection } from '../types'

const connectionTypeToConnection: Record<
  Exclude<ConnectionType, ConnectionType.WALLET_CONNECT_V2>,
  Web3ReactConnection
> = {
  [ConnectionType.INJECTED]: injectedWalletConnection,
  [ConnectionType.METAMASK]: metaMaskSdkConnection,
  [ConnectionType.COINBASE_WALLET]: coinbaseWalletConnection,
  [ConnectionType.NETWORK]: networkConnection,
  [ConnectionType.GNOSIS_SAFE]: gnosisSafeConnection,
  [ConnectionType.TREZOR]: trezorConnection,
}
const STATIC_CONNECTIONS: Web3ReactConnection[] = Object.values(connectionTypeToConnection)

export function getWeb3ReactConnection(c: Connector | ConnectionType): Web3ReactConnection {
  if (c instanceof WalletConnectV2Connector || c === ConnectionType.WALLET_CONNECT_V2) {
    return getWalletConnectV2Connection(getCurrentChainIdFromUrl())
  }

  if (c instanceof Connector) {
    const connection = STATIC_CONNECTIONS.find((connection) => connection.connector === c)
    if (!connection) {
      throw Error('unsupported connector')
    }
    return connection
  }

  const connection = connectionTypeToConnection[c]

  if (!connection) {
    throw Error('unsupported connector')
  }

  return connection
}
