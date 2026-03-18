import { ReactNode, useEffect, useRef } from 'react'

import { SafeProvider, useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useConnect, useConnection, useConnectors, useReconnect, WagmiProvider } from 'wagmi'

import { REOWN_USE_NOOP_STORAGE, wagmiAdapter } from './config'

import { USER_DISCONNECTED_SESSION_KEY } from '../constants'

import type { Connector } from 'wagmi'

const queryClient = new QueryClient()

interface Web3ProviderProps {
  children: ReactNode
}

function ReconnectOnMount(): null {
  const { mutate: reconnect } = useReconnect()
  const didReconnect = useRef(false)

  useEffect(() => {
    if (!shouldReconnectOnMount()) return
    if (didReconnect.current) return
    didReconnect.current = true
    reconnect()
  }, [reconnect])

  return null
}

const INJECTED_AUTO_CONNECT_DELAY_MS = 400

/** True when the app is in an embedded context (e.g. Safe app iframe, in-app browser) where we want to auto-connect to injected. */
function isInEmbeddedContext(): boolean {
  if (typeof window === 'undefined') return false
  return window.self !== window.top
}

function shouldReconnectOnMount(): boolean {
  if (REOWN_USE_NOOP_STORAGE) return false
  return isInEmbeddedContext()
}

/** When the app is opened inside an in-app browser (e.g. Safe app iframe, MetaMask iOS), connect to the injected provider so the user stays connected. Skipped on normal desktop to avoid opening the extension (e.g. Rabby) on every reload. */
function InjectedBrowserAutoConnect(): null {
  const { address, isConnected } = useConnection()
  const connectors = useConnectors()
  const { mutateAsync: connect } = useConnect()
  const didTryInjected = useRef(false)

  useEffect(() => {
    if (!isInEmbeddedContext()) return
    if (isConnected || !!address) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(USER_DISCONNECTED_SESSION_KEY)
      }
      return
    }
    if (didTryInjected.current) return
    if (!window.ethereum) return
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(USER_DISCONNECTED_SESSION_KEY)) {
      return
    }

    const timeoutId = setTimeout(() => {
      if (didTryInjected.current) return
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(USER_DISCONNECTED_SESSION_KEY)) {
        return
      }
      const injectedConnector = connectors.find(
        (c: Connector) =>
          c.type === 'injected' || (c.id && (c.id === 'injected' || c.id.startsWith('io.') || c.id === 'metaMask')),
      )
      if (!injectedConnector) return
      didTryInjected.current = true
      connect({ connector: injectedConnector }).catch(() => {
        didTryInjected.current = false
      })
    }, INJECTED_AUTO_CONNECT_DELAY_MS)

    return () => clearTimeout(timeoutId)
  }, [address, isConnected, connectors, connect])

  return null
}

export function Web3Provider({ children }: Web3ProviderProps): React.ReactNode {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SafeProvider>
          <ReconnectOnMount />
          <InjectedBrowserAutoConnect />
          <SafeConnectionHandler>{children}</SafeConnectionHandler>
        </SafeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function SafeConnectionHandler({ children }: Web3ProviderProps): React.ReactNode {
  const { connector: currentConnector } = useConnection()
  const { mutateAsync: connect } = useConnect()
  const connectors = useConnectors()
  const { connected: isConnectedThroughSafeApp } = useSafeAppsSDK()
  const didAttemptSafeConnect = useRef(false)

  useEffect(() => {
    if (!isConnectedThroughSafeApp || currentConnector?.id === 'safe') {
      return
    }
    if (didAttemptSafeConnect.current) {
      return
    }
    const safeConnector = connectors.find((connector: Connector) => connector.id === 'safe')
    if (!safeConnector) return

    didAttemptSafeConnect.current = true
    connect({ connector: safeConnector }).catch(() => {
      didAttemptSafeConnect.current = false
    })
  }, [currentConnector, isConnectedThroughSafeApp, connect, connectors])

  return children
}
