import { useEffect, useMemo, useState } from 'react'

import { Connector, useConnection } from 'wagmi'

import { useConnectionType } from './useConnectionType'

import { useGnosisSafeInfo } from '../../api/hooks'
import { ConnectionType } from '../../api/types'
import { COW_WIDGET_CONNECTOR_ID } from '../../reown/consts'
import { reownAppKit } from '../config'

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
    if (!connector || typeof connector.getProvider !== 'function') {
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

export function useWalletMetaData(): WalletMetaData {
  const { connector } = useConnection()
  const wcPeerMetadata = useWcPeerMetadata(connector)

  const [walletMetaData, setWalletMetaData] = useState<WalletMetaData | null>(null)

  useEffect(() => {
    if (!reownAppKit) return

    return reownAppKit.subscribeWalletInfo((state) => {
      if (state) {
        setWalletMetaData({ walletName: state.name, icon: state.icon })
      }
    })
  }, [])

  return useMemo(() => {
    if (!connector) {
      if (walletMetaData) return walletMetaData

      return METADATA_DISCONNECTED
    }

    if (connector.id === COW_WIDGET_CONNECTOR_ID) {
      return {
        walletName: 'CoW Swap widget',
        icon: 'Identicon',
      }
    }

    if (connector.type === ConnectionType.WALLET_CONNECT_V2) {
      return wcPeerMetadata
    }

    if (connector.type === ConnectionType.GNOSIS_SAFE) {
      // TODO: potentially here is where we'll need to work to show the multiple flavours of Safe wallets
      return METADATA_SAFE
    }

    return {
      icon: connector.icon ?? walletMetaData?.icon,
      walletName: connector.name ?? walletMetaData?.walletName,
    }
  }, [connector, walletMetaData, wcPeerMetadata])
}

/**
 * Detects whether the currently connected wallet is a Safe App
 * It'll be false if connected to Safe wallet via WalletConnect
 */
export function useIsSafeApp(): boolean {
  const connectionType = useConnectionType()

  return connectionType === ConnectionType.GNOSIS_SAFE
}

/**
 * Detects whether the currently connected wallet is a Safe wallet
 * regardless of the connection method (WalletConnect or inside Safe as an App).
 * Warning: this can be false when Safe API is down or rate-limited and does not mean the wallet is not a Safe.
 * TODO: Rename to useHasGnosisSafeInfo.
 */
export function useIsSafeWallet(): boolean {
  return !!useGnosisSafeInfo()
}

/**
 * Detects whether the currently connected wallet is a Safe wallet
 * but NOT loaded as a Safe App.
 *
 * For WalletConnect connections, gnosisSafeInfo is not available because
 * the Safe Apps SDK only works inside the Safe iframe. Instead, we detect
 * Safe wallets by checking the WalletConnect peer metadata name.
 */
export function useIsSafeViaWc(): boolean {
  const isSafeApp = useIsSafeApp()
  const { connector } = useConnection()
  const wcPeerMetadata = useWcPeerMetadata(connector)

  if (isSafeApp) return false
  if (connector?.type !== ConnectionType.WALLET_CONNECT_V2) return false

  const peerName = wcPeerMetadata.walletName?.toLowerCase() || ''

  return peerName.includes('safe')
}
