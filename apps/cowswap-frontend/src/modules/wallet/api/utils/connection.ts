import { ConnectionType } from '../types'

const connectionTypeToName: Record<ConnectionType, string> = {
  [ConnectionType.INJECTED]: 'injected',
  [ConnectionType.INJECTED_WIDGET]: 'CowSwap widget',
  [ConnectionType.COINBASE_WALLET]: 'Coinbase Wallet',
  [ConnectionType.WALLET_CONNECT]: 'WalletConnect',
  [ConnectionType.WALLET_CONNECT_V2]: 'WalletConnect v2',
  [ConnectionType.FORTMATIC]: 'Fortmatic',
  [ConnectionType.NETWORK]: 'Network',
  [ConnectionType.GNOSIS_SAFE]: 'Safe',
  [ConnectionType.ZENGO]: 'Zengo',
  [ConnectionType.AMBIRE]: 'Ambire',
  [ConnectionType.ALPHA]: 'Alpha',
  [ConnectionType.TALLY]: 'Tally',
  [ConnectionType.TRUST]: 'Trust',
  [ConnectionType.LEDGER]: 'Ledger',
  [ConnectionType.KEYSTONE]: 'Keystone',
  [ConnectionType.TREZOR]: 'Trezor',
}

export function getConnectionName(connectionType: ConnectionType, isMetaMask?: boolean): string {
  if (connectionType === ConnectionType.INJECTED && isMetaMask) return 'MetaMask'

  return connectionTypeToName[connectionType]
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

export function getIsTrustWallet(provider: any, name?: string): boolean {
  return provider?.isTrust || name?.toLocaleLowerCase().includes('trust') || false
}

export function getIsTallyWallet(provider: any, name?: string): boolean {
  return provider?.isTally || name?.toLocaleLowerCase().includes('tally') || false
}
