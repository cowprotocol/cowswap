
import { Web3ReactHooks } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { ConnectionType } from '@cow/modules/wallet'
import { gnosisSafeConnection } from './connection/safe'
import { injectedConnection } from './connection/injected'
import { coinbaseWalletConnection } from './connection/coinbase'
import { walletConnectConnection } from './connection/walletConnect'
import { fortmaticConnection } from './connection/formatic'
import { networkConnection } from './connection/ network'

export interface Connection {
  connector: Connector
  hooks: Web3ReactHooks
  type: ConnectionType
}

const CONNECTIONS: Connection[] = [
  gnosisSafeConnection,
  injectedConnection,
  coinbaseWalletConnection,
  walletConnectConnection,
  fortmaticConnection,
  networkConnection,
]

export function getConnection(c: Connector | ConnectionType): Connection {
  if (c instanceof Connector) {
    const connection = CONNECTIONS.find((connection) => connection.connector === c)
    if (!connection) {
      throw Error('unsupported connector')
    }
    return connection
  } else {
    switch (c) {
      case ConnectionType.INJECTED:
        return injectedConnection
      case ConnectionType.COINBASE_WALLET:
        return coinbaseWalletConnection
      case ConnectionType.WALLET_CONNECT:
        return walletConnectConnection
      case ConnectionType.FORTMATIC:
        return fortmaticConnection
      case ConnectionType.NETWORK:
        return networkConnection
      case ConnectionType.GNOSIS_SAFE:
        return gnosisSafeConnection
    }
  }
}
