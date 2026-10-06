import { useEffect, useMemo, useState } from 'react'

import { Connector, useConnection } from 'wagmi'

import { ConnectionType } from '../../api/types'
import { svgBaseSrc } from '../../assets'
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

const METADATA_BASE_ACCOUNT: WalletMetaData = {
  walletName: 'Base Account',
  icon: svgBaseSrc,
}

// Connector types whose metadata is fixed and shouldn't fall back to walletMetaData (which is
// populated by reownAppKit.subscribeWalletInfo and can be stale for connectors, like baseAccount,
// whose own connect flow doesn't go through AppKit's wallet-selection UI).
const STATIC_METADATA_BY_CONNECTOR_TYPE: Partial<Record<ConnectionType, WalletMetaData>> = {
  [ConnectionType.GNOSIS_SAFE]: METADATA_SAFE,
  [ConnectionType.BASE_ACCOUNT]: METADATA_BASE_ACCOUNT,
}

export interface WalletMetaData {
  walletName?: string
  icon?: string
}

// fix for this https://github.com/gnosis/cowswap/issues/1929
const defaultWcPeerOutput = { walletName: undefined, icon: undefined }

export function useWalletMetaData(): WalletMetaData {
  const { connector } = useConnection()
  const wcPeerMetadata = useWcPeerMetadata(connector)

  const [walletMetaData, setWalletMetaData] = useState<WalletMetaData | null>(null)

  useEffect(() => {
    if (!reownAppKit) return

    return reownAppKit.subscribeWalletInfo((state) => {
      if (state) {
        setWalletMetaData({ walletName: state.name, icon: state.icon })
      } else {
        setWalletMetaData(null)
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

    // TODO: potentially here is where we'll need to work to show the multiple flavours of Safe wallets
    const staticMetadata = STATIC_METADATA_BY_CONNECTOR_TYPE[connector.type as ConnectionType]
    if (staticMetadata) {
      return staticMetadata
    }

    return {
      icon: connector.icon ?? walletMetaData?.icon,
      walletName: connector.name ?? walletMetaData?.walletName,
    }
  }, [connector, walletMetaData, wcPeerMetadata])
}

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
