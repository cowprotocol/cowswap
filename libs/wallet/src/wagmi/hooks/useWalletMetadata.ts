import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { useConnection } from 'wagmi'

import { useGnosisSafeInfo, useSelectedEip6963ProviderInfo } from '../../api/hooks'
import { ConnectorType } from '../../api/types'

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

export function useWalletMetaData(standaloneMode?: boolean): WalletMetaData {
  const { connector } = useConnection()
  const selectedEip6963Provider = useSelectedEip6963ProviderInfo()

  if (!connector) {
    return METADATA_DISCONNECTED
  }

  if (connector.type === ConnectorType.INJECTED) {
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

  if (connector.type === ConnectorType.WALLET_CONNECT_V2) {
    // TODO M-2 COW-568
  }

  if (connector.type === ConnectorType.GNOSIS_SAFE) {
    // TODO: potentially here is where we'll need to work to show the multiple flavours of Safe wallets
    return METADATA_SAFE
  }

  return {
    icon: connector.icon,
    walletName: connector.name,
  }
}

/**
 * Detects whether the currently connected wallet is a Safe App
 * It'll be false if connected to Safe wallet via WalletConnect
 */
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

/**
 * Detects whether the currently connected wallet is a Safe wallet
 * but NOT loaded as a Safe App
 */
export function useIsSafeViaWc(): boolean {
  const isSafeApp = useIsSafeApp()
  const isSafeWallet = useIsSafeWallet()

  return isSafeWallet && !isSafeApp
}
