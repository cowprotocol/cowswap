import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { useConnection } from 'wagmi'

import { useGnosisSafeInfo } from '../../api/hooks'

const METADATA_DISCONNECTED: WalletMetaData = {
  walletName: undefined,
  icon: undefined,
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
    icon: connector.icon,
    walletName: connector.name,
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
