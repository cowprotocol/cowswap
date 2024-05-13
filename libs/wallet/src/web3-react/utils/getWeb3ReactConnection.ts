import { Connector } from '@web3-react/types'

import { ConnectionType } from '../../api/types'
import { coinbaseWalletConnection } from '../connection/coinbase'
import { injectedWalletConnection } from '../connection/injectedWallet'
import { keystoneConnection } from '../connection/keystone'
import { networkConnection } from '../connection/network'
import { gnosisSafeConnection } from '../connection/safe'
import { tallyWalletConnection } from '../connection/tally'
import { trezorConnection } from '../connection/trezor'
import { trustWalletConnection } from '../connection/trust'
import { walletConnectConnectionV2 } from '../connection/walletConnectV2'
import { Web3ReactConnection } from '../types'

const connectionTypeToConnection: Record<ConnectionType, Web3ReactConnection> = {
  [ConnectionType.INJECTED]: injectedWalletConnection,
  [ConnectionType.COINBASE_WALLET]: coinbaseWalletConnection,
  [ConnectionType.WALLET_CONNECT_V2]: walletConnectConnectionV2,
  [ConnectionType.ZENGO]: walletConnectConnectionV2,
  [ConnectionType.NETWORK]: networkConnection,
  [ConnectionType.GNOSIS_SAFE]: gnosisSafeConnection,
  [ConnectionType.AMBIRE]: walletConnectConnectionV2,
  [ConnectionType.ALPHA]: walletConnectConnectionV2,
  [ConnectionType.TALLY]: tallyWalletConnection,
  [ConnectionType.TRUST]: trustWalletConnection,
  [ConnectionType.KEYSTONE]: keystoneConnection,
  [ConnectionType.TREZOR]: trezorConnection,
}
const CONNECTIONS: Web3ReactConnection[] = Object.values(connectionTypeToConnection)

export function getWeb3ReactConnection(c: Connector | ConnectionType): Web3ReactConnection {
  if (c instanceof Connector) {
    const connection = CONNECTIONS.find((connection) => connection.connector === c)
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
