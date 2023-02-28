import { Connector } from '@web3-react/types'
import {
  coinbaseWalletConnection,
  Connection,
  ConnectionType,
  fortmaticConnection,
  gnosisSafeConnection,
  injectedConnection,
  networkConnection,
  trustWalletConnection,
  walletConnectConnection,
} from './connections'

export function getIsInjected(): boolean {
  return Boolean(window.ethereum)
}

export function getIsMetaMask(): boolean {
  return window.ethereum?.isMetaMask ?? false
}

export function getIsCoinbaseWallet(): boolean {
  return window.ethereum?.isCoinbaseWallet ?? false
}

export function getIsAmbireWallet(name: string | undefined): boolean {
  return name?.toLocaleLowerCase().includes('ambire') || false
}

export function getIsZengoWallet(name: string | undefined): boolean {
  return name?.toLocaleLowerCase().includes('zengo') || false
}

export function getIsAlphaWallet(name: string | undefined): boolean {
  return name?.toLocaleLowerCase().includes('alpha') || false
}

const CONNECTIONS: Connection[] = [
  gnosisSafeConnection,
  injectedConnection,
  coinbaseWalletConnection,
  walletConnectConnection,
  fortmaticConnection,
  networkConnection,
  trustWalletConnection,
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
      case ConnectionType.ZENGO:
        return walletConnectConnection
      case ConnectionType.AMBIRE:
        return walletConnectConnection
      case ConnectionType.ALPHA_WALLET:
        return walletConnectConnection
      case ConnectionType.TRUST_WALLET:
        return trustWalletConnection
    }
  }
}

export function getConnectionName(connectionType: ConnectionType, isMetaMask?: boolean) {
  switch (connectionType) {
    case ConnectionType.INJECTED:
      return isMetaMask ? 'MetaMask' : 'Injected'
    case ConnectionType.COINBASE_WALLET:
      return 'Coinbase Wallet'
    case ConnectionType.WALLET_CONNECT:
      return 'WalletConnect'
    case ConnectionType.FORTMATIC:
      return 'Fortmatic'
    case ConnectionType.NETWORK:
      return 'Network'
    case ConnectionType.GNOSIS_SAFE:
      return 'Gnosis Safe'
    case ConnectionType.ZENGO:
      return 'Zengo'
    case ConnectionType.AMBIRE:
      return 'Ambire'
    case ConnectionType.ALPHA_WALLET:
      return 'Alpha wallet'
    case ConnectionType.TRUST_WALLET:
      return 'Trust wallet'
  }
}
