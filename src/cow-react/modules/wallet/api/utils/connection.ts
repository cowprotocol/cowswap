import { ConnectionType } from '../types'

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
    case ConnectionType.ALPHA:
      return 'Alpha'
    case ConnectionType.TALLY:
      return 'Tally'
    case ConnectionType.LEDGER:
      return 'Ledger'
    case ConnectionType.KEYSTONE:
      return 'Keystone'
  }
}

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
