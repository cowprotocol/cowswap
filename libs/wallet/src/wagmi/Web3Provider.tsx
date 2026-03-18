import { ReactNode, useEffect, useRef } from 'react'

import { SafeProvider, useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { useAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useConnect, useConnection, useConnectors, useReconnect, WagmiProvider } from 'wagmi'

import { REOWN_USE_NOOP_STORAGE, wagmiAdapter } from './config'

import { OPEN_WALLET_MODAL_EVENT, USER_DISCONNECTED_SESSION_KEY } from '../constants'

import type { Connector } from 'wagmi'

const WALLET_MODAL_OPEN_THROTTLE_MS = 1200

/** Listens for OPEN_WALLET_MODAL_EVENT, runs reconnect then opens AppKit modal. Must be mounted inside Web3Provider so useReconnect is valid. */
function WalletModalOpenListener(): null {
  const { mutateAsync: reconnect } = useReconnect()
  const { open } = useAppKit()
  const { connected: isConnectedThroughSafeApp } = useSafeAppsSDK()
  const lastOpenTimeRef = useRef(0)

  useEffect(() => {
    const handler = (): void => {
      const now = Date.now()
      if (now - lastOpenTimeRef.current < WALLET_MODAL_OPEN_THROTTLE_MS) return
      lastOpenTimeRef.current = now
      if (!isConnectedThroughSafeApp) {
        open()
        return
      }
      void reconnect({ connectors: undefined })
        .then(() => open())
        .catch(() => open())
    }
    document.addEventListener(OPEN_WALLET_MODAL_EVENT, handler)
    return () => document.removeEventListener(OPEN_WALLET_MODAL_EVENT, handler)
  }, [reconnect, open, isConnectedThroughSafeApp])

  return null
}

const queryClient = new QueryClient()

interface Web3ProviderProps {
  children: ReactNode
}

function ReconnectOnMount(): null {
  const { mutate: reconnect } = useReconnect()
  const connectors = useConnectors()
  const { connected: isConnectedThroughSafeApp } = useSafeAppsSDK()
  const didReconnect = useRef(false)

  useEffect(() => {
    if (!shouldReconnectOnMount()) return
    if (didReconnect.current) return
    if (isConnectedThroughSafeApp) return
    didReconnect.current = true
    reconnect({ connectors: connectors.filter((c: Connector) => c.id !== 'safe') })
  }, [reconnect, connectors, isConnectedThroughSafeApp])

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
          <WalletModalOpenListener />
          <InjectedBrowserAutoConnect />
          <SafeConnectionHandler>{children}</SafeConnectionHandler>
        </SafeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

let safeConnectAttemptedThisSession = false

function SafeConnectionHandler({ children }: Web3ProviderProps): React.ReactNode {
  const { connector: currentConnector } = useConnection()
  const { mutateAsync: connect } = useConnect()
  const connectors = useConnectors()
  const { connected: isConnectedThroughSafeApp } = useSafeAppsSDK()

  useEffect(() => {
    if (!isConnectedThroughSafeApp || currentConnector?.id === 'safe') {
      return
    }
    if (safeConnectAttemptedThisSession) {
      return
    }
    const safeConnector = connectors.find((connector: Connector) => connector.id === 'safe')
    if (!safeConnector) return

    safeConnectAttemptedThisSession = true
    connect({ connector: safeConnector }).catch(() => {
      safeConnectAttemptedThisSession = false
    })
  }, [currentConnector, isConnectedThroughSafeApp, connect, connectors])

  return children
}
