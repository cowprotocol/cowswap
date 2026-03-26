import { useEffect, useRef, type ReactNode } from 'react'

import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { connect, getConnection, reconnect } from '@wagmi/core'
import { type Connector, useConnection, useConnectors, useDisconnect } from 'wagmi'

import { config } from './config'

import { ConnectionType } from '../api/types'

interface SafeConnectionHandlerProps {
  children: ReactNode
}

function isEmbeddedApp(): boolean {
  return typeof window !== 'undefined' && window.self !== window.top
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
  const { mutateAsync: disconnect } = useDisconnect()
  const { connected: isConnectedThroughSafeApp, safe } = useSafeAppsSDK()
  const isConnectingToSafe = useRef(false)

  const isInSafeSdkContext = isConnectedThroughSafeApp && !!safe?.safeAddress

  const safeRef = useRef(safe)
  const sdkConnectedRef = useRef(isConnectedThroughSafeApp)
  const connectorsRef = useRef(connectors)
  const isConnectedRef = useRef(isConnected)
  const currentConnectorRef = useRef(currentConnector)

  useEffect(() => {
    safeRef.current = safe
    sdkConnectedRef.current = isConnectedThroughSafeApp
    connectorsRef.current = connectors
    isConnectedRef.current = isConnected
    currentConnectorRef.current = currentConnector
  }, [safe, isConnectedThroughSafeApp, connectors, isConnected, currentConnector])

  useEffect(() => {
    if (!isInSafeSdkContext) return
    if (!currentConnector || isSafeConnector(currentConnector)) return

    isConnectingToSafe.current = false
    void disconnect().catch(() => {})
  }, [currentConnector, isInSafeSdkContext, disconnect])

  useEffect(() => {
    if (!isEmbeddedApp()) return
    if (isConnected && isSafeConnector(currentConnector)) return
    if (isConnectingToSafe.current) return

    isConnectingToSafe.current = true
    void connectSafeInIframe(safe, isConnectedThroughSafeApp, connectors)
      .catch(() => {})
      .finally(() => {
        isConnectingToSafe.current = false
      })
  }, [currentConnector, isConnected, isConnectedThroughSafeApp, connectors, safe])

  useEffect(() => {
    if (!isEmbeddedApp()) return

    const reconnectSafeIfNeeded = (): void => {
      if (document.visibilityState === 'hidden') return
      if (isConnectedRef.current && isSafeConnector(currentConnectorRef.current)) return
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
