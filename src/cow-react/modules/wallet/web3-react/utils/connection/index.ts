
import { Web3ReactHooks } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { ConnectionType } from '@cow/modules/wallet'
import { gnosisSafeConnection } from '../../containers/ConnectWalletOptions/SafeOption'
import { injectedConnection } from '../../containers/ConnectWalletOptions/InjectedOption'
import { coinbaseWalletConnection } from '../../containers/ConnectWalletOptions/CoinbaseWalletOption'
import { walletConnectConnection } from '../../containers/ConnectWalletOptions/WalletConnectOption'
import { fortmaticConnection } from '../../containers/ConnectWalletOptions/FortmaticOption'
import { networkConnection } from '../../containers/ConnectWalletOptions/NetworkOption'

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
