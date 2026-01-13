import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { useConnection } from 'wagmi'

import { useGnosisSafeInfo } from '../../api/hooks'

const SAFE_APP_NAME = 'Safe App'

const SAFE_ICON_URL = 'https://app.safe.global/favicon.ico'

const METADATA_DISCONNECTED: WalletMetaData = {
  walletName: undefined,
  icon: undefined,
}

const _METADATA_SAFE: WalletMetaData = {
  walletName: SAFE_APP_NAME,
  icon: SAFE_ICON_URL,
}

export interface WalletMetaData {
  walletName?: string
  icon?: string
}

export function useWalletMetaData(_standaloneMode?: boolean): WalletMetaData {
  const { connector } = useConnection()

  if (!connector) {
    return METADATA_DISCONNECTED
  }

  return {
    walletName: connector.name,
    icon: connector.icon,
  }
}

export function useIsSafeApp(): boolean {
  const { connected } = useSafeAppsSDK()

  return connected
}

/**
 * Detects whether the currently connected wallet is a Safe wallet
 * regardless of the connection method (WalletConnect or inside Safe as an App)
 */
export function useIsSafeWallet(): boolean {
  return !!useGnosisSafeInfo()
}
