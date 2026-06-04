import { useEffect, useRef, type ReactNode } from 'react'

import { getCurrentChainIdFromUrl, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { connect, getConnection, reconnect } from '@wagmi/core'
import { type Connector, useConnection, useConnectors } from 'wagmi'

import { config, IS_CROSS_ORIGIN_IFRAME } from './config'

import { ConnectionType } from '../api/types'
import { COW_WIDGET_CONNECTOR_ID } from '../reown/consts'

interface SafeConnectionHandlerProps {
  children: ReactNode
}

function isEmbeddedApp(): boolean {
  return IS_CROSS_ORIGIN_IFRAME
}

function isSupportedChainId(chainId: number): chainId is SupportedChainId {
  return Object.values(SupportedChainId).includes(chainId as SupportedChainId)
}

function isSafeConnector(c: Connector | undefined): boolean {
  return c?.id === 'safe' || c?.type === ConnectionType.GNOSIS_SAFE
}

function findSafeConnector(connectors: readonly Connector[]): Connector | undefined {
  const byStandard = connectors.find((c) => c.id === 'safe' || c.type === ConnectionType.GNOSIS_SAFE)
  if (byStandard) return byStandard
  return connectors.find((c) => {
    const id = typeof c.id === 'string' ? c.id.toLowerCase() : ''
    return id.includes('safe') || c.name?.toLowerCase().includes('safe')
  })
}

function getRegisteredSafeConnector(fallbackFromHook: readonly Connector[]): Connector | undefined {
  const fromConfig = config.connectors as readonly Connector[] | undefined
  const list = Array.isArray(fromConfig) && fromConfig.length > 0 ? fromConfig : fallbackFromHook
  if (!Array.isArray(list) || list.length === 0) return undefined
  return findSafeConnector(list)
}

function resolveEmbeddedChainId(safe: { chainId?: number } | undefined, sdkConnected: boolean): number {
  const fromUrl = getCurrentChainIdFromUrl()
  const sdkChain = safe?.chainId
  if (sdkConnected && typeof sdkChain === 'number' && isSupportedChainId(sdkChain)) {
    return sdkChain
  }
  return fromUrl
}

async function connectSafeInIframe(
  safe: { chainId?: number } | undefined,
  sdkConnected: boolean,
  connectorsFallback: readonly Connector[],
): Promise<void> {
  const safeConnector = getRegisteredSafeConnector(connectorsFallback)
  if (!safeConnector) return

  const chainId = resolveEmbeddedChainId(safe, sdkConnected)

  try {
    await reconnect(config, { connectors: [safeConnector] })
  } catch {
    // No persisted session — fall through to connect()
  }

  const connection = getConnection(config)
  if (connection.status === 'connected' && isSafeConnector(connection.connector)) return

  await connect(config, { chainId, connector: safeConnector })
}

export function SafeConnectionHandler({ children }: SafeConnectionHandlerProps): ReactNode {
  const { connector: currentConnector, isConnected } = useConnection()
  const connectors = useConnectors()
  const { connected: isConnectedThroughSafeApp, safe } = useSafeAppsSDK()
  const isInSafeSdkContext = isConnectedThroughSafeApp && !!safe?.safeAddress
  const isConnectingToSafe = useRef(false)

  const safeRef = useRef(safe)
  const sdkConnectedRef = useRef(isConnectedThroughSafeApp)
  const connectorsRef = useRef(connectors)
  const isConnectedRef = useRef(isConnected)
  const currentConnectorRef = useRef(currentConnector)
  const isInSafeSdkContextRef = useRef(isInSafeSdkContext)

  useEffect(() => {
    safeRef.current = safe
    sdkConnectedRef.current = isConnectedThroughSafeApp
    connectorsRef.current = connectors
    isConnectedRef.current = isConnected
    currentConnectorRef.current = currentConnector
    isInSafeSdkContextRef.current = isInSafeSdkContext
  }, [safe, isConnectedThroughSafeApp, connectors, isConnected, currentConnector, isInSafeSdkContext])

  useEffect(() => {
    const isConnectedToWidget = currentConnectorRef.current?.id === COW_WIDGET_CONNECTOR_ID

    if (!isEmbeddedApp()) return
    if (isConnected && isSafeConnector(currentConnector)) return
    // In widget context without Safe SDK: wallet is provided by the parent dapp via WidgetEthereumProvider.
    // Skip Safe auto-connect entirely to avoid competing with the COW_WIDGET_CONNECTOR_ID connection.
    if (isConnectedToWidget) return
    if (isConnectingToSafe.current) return

    isConnectingToSafe.current = true
    void connectSafeInIframe(safe, isConnectedThroughSafeApp, connectors)
      .catch(() => {})
      .finally(() => {
        isConnectingToSafe.current = false
      })
  }, [currentConnector, isConnected, isConnectedThroughSafeApp, connectors, safe, isInSafeSdkContext])

  useEffect(() => {
    if (!isEmbeddedApp()) return

    const reconnectSafeIfNeeded = (): void => {
      const isConnectedToWidget = currentConnectorRef.current?.id === COW_WIDGET_CONNECTOR_ID

      if (isConnectedToWidget) return
      if (document.visibilityState === 'hidden') return
      if (isConnectedRef.current && isSafeConnector(currentConnectorRef.current)) return
      if (isInjectedWidget() && !isInSafeSdkContextRef.current) return
      if (isConnectingToSafe.current) return

      isConnectingToSafe.current = true
      void connectSafeInIframe(safeRef.current, sdkConnectedRef.current, connectorsRef.current)
        .catch(() => {})
        .finally(() => {
          isConnectingToSafe.current = false
        })
    }

    window.addEventListener('focus', reconnectSafeIfNeeded)
    document.addEventListener('visibilitychange', reconnectSafeIfNeeded)
    return () => {
      window.removeEventListener('focus', reconnectSafeIfNeeded)
      document.removeEventListener('visibilitychange', reconnectSafeIfNeeded)
    }
  }, [])

  return children
}
