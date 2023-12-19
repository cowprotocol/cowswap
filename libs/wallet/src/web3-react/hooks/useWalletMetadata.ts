import { useMemo } from 'react'

import { useWeb3React } from '@web3-react/core'

import { default as AlphaImage } from '../../api/assets/alpha.svg'
import { ConnectionType } from '../../api/types'
import { getIsAlphaWallet } from '../../api/utils/connection'
import { getWeb3ReactConnection } from '../utils/getWeb3ReactConnection'

const WC_DESKTOP_GNOSIS_SAFE_APP_NAME = 'WalletConnect Safe App'
const WC_MOBILE_GNOSIS_SAFE_APP_NAME = 'Safe'
const SAFE_APP_NAME = 'Safe App'
const GNOSIS_SAFE_APP_NAME = 'Gnosis Safe App'
const SAFE_WALLET_NAME = 'Safe{Wallet}'
const SAFE_WALLET_IOS = 'Safe (iOS)'
const GNOSIS_APP_NAMES = [
  SAFE_APP_NAME,
  GNOSIS_SAFE_APP_NAME,
  WC_DESKTOP_GNOSIS_SAFE_APP_NAME,
  WC_MOBILE_GNOSIS_SAFE_APP_NAME,
  SAFE_WALLET_NAME,
  SAFE_WALLET_IOS,
]

const SAFE_ICON_URL = 'https://app.safe.global/favicon.ico'

const METADATA_DISCONNECTED: WalletMetaData = {
  walletName: undefined,
  icon: undefined,
}

const METADATA_SAFE: WalletMetaData = {
  walletName: SAFE_APP_NAME,
  icon: SAFE_ICON_URL,
}

export interface WalletMetaData {
  walletName?: string
  icon?: string
}

function getWcWalletIcon(meta: any) {
  if (getIsAlphaWallet(meta.name)) {
    return AlphaImage
  }

  return meta.icons?.length > 0 ? meta.icons[0] : undefined
}

function getWcPeerMetadata(provider: any | undefined): WalletMetaData {
  // fix for this https://github.com/gnosis/cowswap/issues/1929
  const defaultOutput = { walletName: undefined, icon: undefined }

  if (!provider) {
    return defaultOutput
  }

  const v1MetaData = provider?.connector?.peerMeta
  const v2MetaData = provider?.signer?.session?.peer?.metadata
  const meta = v1MetaData || v2MetaData

  if (meta) {
    return {
      walletName: meta.name,
      icon: getWcWalletIcon(meta),
    }
  }

  return defaultOutput
}

// FIXME: I notice this function is not calculating always correctly the walletName. Out of scope of this PR to fix. "getConnnectionName" might help
export function useWalletMetaData(): WalletMetaData {
  const { connector, provider, account } = useWeb3React()
  const connectionType = getWeb3ReactConnection(connector).type

  return useMemo<WalletMetaData>(() => {
    if (!account) {
      return METADATA_DISCONNECTED
    }

    if (connectionType === ConnectionType.WALLET_CONNECT_V2) {
      const wc = provider?.provider

      if ((wc as any)?.isWalletConnect) {
        return getWcPeerMetadata(wc)
      }
    }

    if (connectionType === ConnectionType.GNOSIS_SAFE) {
      return METADATA_SAFE
    }

    return METADATA_DISCONNECTED
  }, [connectionType, provider, account])
}

/**
 * Detects whether the currently connected wallet is a Safe App
 * It'll be false if connected to Safe wallet via WalletConnect
 */
export function useIsSafeApp(): boolean {
  const { walletName } = useWalletMetaData()

  return walletName === SAFE_APP_NAME
}

/**
 * Detects whether the currently connected wallet is a Safe wallet
 * regardless of the connection method (WalletConnect or inside Safe as an App)
 */
export function useIsSafeWallet(): boolean {
  const { walletName } = useWalletMetaData()

  if (!walletName) return false

  return GNOSIS_APP_NAMES.includes(walletName.trim())
}

/**
 * Detects whether the currently connected wallet is a Safe wallet
 * but NOT loaded as a Safe App
 */
export function useIsSafeViaWc(): boolean {
  const isSafeApp = useIsSafeApp()
  const isSafeWallet = useIsSafeWallet()

  return isSafeWallet && !isSafeApp
}
