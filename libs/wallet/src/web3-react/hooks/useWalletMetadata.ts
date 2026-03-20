import { useMemo } from 'react'

import { useWeb3React } from '@web3-react/core'

import { useSafeAppsSdk } from './useSafeAppsSdk'

import { useGnosisSafeInfo, useSelectedEip6963ProviderInfo } from '../../api/hooks'
import { ConnectionType } from '../../api/types'
import { getConnectionIcon, getConnectionName } from '../../api/utils/connection'
import { getWeb3ReactConnection } from '../utils/getWeb3ReactConnection'

const SAFE_APP_NAME = 'Safe App'

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

// TODO: Add proper return type annotation
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
function getWcWalletIcon(meta: any) {
  return meta.icons?.length > 0 ? meta.icons[0] : undefined
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
export function useWalletMetaData(standaloneMode?: boolean): WalletMetaData {
  const { connector, provider, account } = useWeb3React()
  const selectedEip6963Provider = useSelectedEip6963ProviderInfo()
  const connectionType = getWeb3ReactConnection(connector).type

  return useMemo<WalletMetaData>(() => {
    if (!account) {
      return METADATA_DISCONNECTED
    }

    if (connectionType === ConnectionType.INJECTED) {
      if (standaloneMode === false) {
        return {
          walletName: 'CoW Swap widget',
          icon: 'Identicon',
        }
      }

      if (selectedEip6963Provider) {
        return {
          icon: selectedEip6963Provider.info.icon,
          walletName: selectedEip6963Provider.info.name,
        }
      }
    }

    if (connectionType === ConnectionType.WALLET_CONNECT_V2) {
      const wc = provider?.provider

      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((wc as any)?.isWalletConnect) {
        return getWcPeerMetadata(wc)
      }
    }

    if (connectionType === ConnectionType.GNOSIS_SAFE) {
      // TODO: potentially here is where we'll need to work to show the multiple flavours of Safe wallets
      return METADATA_SAFE
    }

    return {
      icon: getConnectionIcon(connectionType),
      walletName: getConnectionName(connectionType),
    }
  }, [connectionType, provider, account, selectedEip6963Provider, standaloneMode])
}

/**
 * Detects whether the currently connected wallet is a Safe App
 * It'll be false if connected to Safe wallet via WalletConnect
 */
export function useIsSafeApp(): boolean {
  const isSafeWallet = useIsSafeWallet()
  const sdk = useSafeAppsSdk()

  // If the wallet is not a Safe, or we don't have access to the SafeAppsSDK, we know is not a Safe App
  if (!isSafeWallet || !sdk) {
    return false
  }

  // Will only be a SafeApp if within an iframe
  // Which means, window.parent is different than window
  return window?.parent !== window
}

/**
 * Detects whether the currently connected wallet is a Safe wallet
 * regardless of the connection method (WalletConnect or inside Safe as an App)
 */
export function useIsSafeWallet(): boolean {
  return !!useGnosisSafeInfo()
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
