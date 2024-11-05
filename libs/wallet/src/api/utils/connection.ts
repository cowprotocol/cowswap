import { isMobile } from '@cowprotocol/common-utils'

import { default as MetamaskImage } from '../../api/assets/metamask.png'
import CoinbaseWalletIcon from '../assets/coinbase.svg'
import TrezorIcon from '../assets/trezor.svg'
import WalletConnectIcon from '../assets/walletConnectIcon.svg'
import { ConnectionType } from '../types'

const connectionTypeToName: Record<ConnectionType, string> = {
  [ConnectionType.INJECTED]: 'Injected',
  [ConnectionType.METAMASK]: 'MetaMask',
  [ConnectionType.COINBASE_WALLET]: 'Coinbase Wallet',
  [ConnectionType.WALLET_CONNECT_V2]: 'WalletConnect',
  [ConnectionType.NETWORK]: 'Network',
  [ConnectionType.GNOSIS_SAFE]: 'Safe',
  [ConnectionType.TREZOR]: 'Trezor',
}

const IDENTICON_KEY = 'Identicon'

const connectionTypeToIcon: Record<ConnectionType, 'Identicon' | string> = {
  [ConnectionType.INJECTED]: IDENTICON_KEY,
  [ConnectionType.METAMASK]: MetamaskImage,
  [ConnectionType.GNOSIS_SAFE]: IDENTICON_KEY,
  [ConnectionType.NETWORK]: IDENTICON_KEY,
  [ConnectionType.COINBASE_WALLET]: CoinbaseWalletIcon,
  [ConnectionType.TREZOR]: TrezorIcon,
  [ConnectionType.WALLET_CONNECT_V2]: WalletConnectIcon,
}

export function getConnectionIcon(connectionType: ConnectionType): string {
  return connectionTypeToIcon[connectionType]
}

export function getConnectionName(connectionType: ConnectionType): string {
  return connectionTypeToName[connectionType]
}

export function getIsInjected(): boolean {
  return Boolean(window.ethereum)
}

export function getIsInjectedMobileBrowser(): boolean {
  return getIsInjected() && isMobile
}
