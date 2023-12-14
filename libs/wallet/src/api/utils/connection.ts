import CoinbaseWalletIcon from '../assets/coinbase.svg'
import KeystoneImage from '../assets/keystone.svg'
// import LedgerIcon from '../assets/ledger.svg'
import TallyIcon from '../assets/tally.svg'
import TrezorIcon from '../assets/trezor.svg'
import TrustIcon from '../assets/trust.svg'
import WalletConnectIcon from '../assets/walletConnectIcon.svg'
import { ConnectionType } from '../types'

const connectionTypeToName: Record<ConnectionType, string> = {
  [ConnectionType.INJECTED]: 'injected',
  [ConnectionType.INJECTED_WIDGET]: 'CoW Swap widget',
  [ConnectionType.COINBASE_WALLET]: 'Coinbase Wallet',
  [ConnectionType.WALLET_CONNECT_V2]: 'WalletConnect',
  [ConnectionType.NETWORK]: 'Network',
  [ConnectionType.GNOSIS_SAFE]: 'Safe',
  [ConnectionType.ZENGO]: 'Zengo',
  [ConnectionType.AMBIRE]: 'Ambire',
  [ConnectionType.ALPHA]: 'Alpha',
  [ConnectionType.TALLY]: 'Tally',
  [ConnectionType.TRUST]: 'Trust',
  // [ConnectionType.LEDGER]: 'Ledger',
  [ConnectionType.KEYSTONE]: 'Keystone',
  [ConnectionType.TREZOR]: 'Trezor',
}

const IDENTICON_KEY = 'Identicon'

const connectionTypeToIcon: Record<ConnectionType, 'Identicon' | string> = {
  [ConnectionType.INJECTED]: IDENTICON_KEY,
  [ConnectionType.INJECTED_WIDGET]: IDENTICON_KEY,
  [ConnectionType.GNOSIS_SAFE]: IDENTICON_KEY,
  [ConnectionType.NETWORK]: IDENTICON_KEY,
  [ConnectionType.ZENGO]: IDENTICON_KEY,
  [ConnectionType.AMBIRE]: IDENTICON_KEY,
  [ConnectionType.ALPHA]: IDENTICON_KEY,
  [ConnectionType.COINBASE_WALLET]: CoinbaseWalletIcon,
  [ConnectionType.TRUST]: TrustIcon,
  [ConnectionType.TALLY]: TallyIcon,
  // [ConnectionType.LEDGER]: LedgerIcon,
  [ConnectionType.TREZOR]: TrezorIcon,
  [ConnectionType.KEYSTONE]: KeystoneImage,
  [ConnectionType.WALLET_CONNECT_V2]: WalletConnectIcon,
}

export function getConnectionIcon(connectionType: ConnectionType): string {
  return connectionTypeToIcon[connectionType]
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
  return (window.ethereum as { isCoinbaseWallet: boolean })?.isCoinbaseWallet ?? false
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

export function getIsTrustWallet(name: string | undefined): boolean {
  return name?.toLocaleLowerCase().includes('trust') || false
}

export function getIsTallyWallet(provider: any, name?: string): boolean {
  return provider?.isTally || name?.toLocaleLowerCase().includes('tally') || false
}
