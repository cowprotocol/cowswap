import { useEffect, useMemo, useState } from 'react'

import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { Connector, useConnection } from 'wagmi'

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

// fix for this https://github.com/gnosis/cowswap/issues/1929
const defaultWcPeerOutput = { walletName: undefined, icon: undefined }

function useWcPeerMetadata(connector?: Connector): WalletMetaData {
  const [peerWalletName, setPeerWalletName] = useState('')

  const peerWalletMetadata = useMemo(() => {
    if (!peerWalletName || !connector) {
      return null
    }
    return {
      walletName: peerWalletName,
      icon: connector?.icon,
    }
  }, [peerWalletName, connector])

  useEffect(() => {
    if (!connector) {
      setPeerWalletName('')
      return
    }
    const fetchPeerMetadata = async (): Promise<void> => {
      try {
        const provider = (await connector.getProvider()) as { session?: { peer?: { metadata?: { name?: string } } } }
        setPeerWalletName(provider?.session?.peer?.metadata?.name || '')
      } catch (error) {
        console.error(error.message)
        setPeerWalletName('')
      }
    }
    fetchPeerMetadata()
  }, [connector])

  return peerWalletMetadata || defaultWcPeerOutput
}

export function useWalletMetaData(standaloneMode?: boolean): WalletMetaData {
  const { connector } = useConnection()
  const wcPeerMetadata = useWcPeerMetadata(connector)
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
    return wcPeerMetadata
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
