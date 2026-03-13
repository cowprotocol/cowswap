import { ReactNode, useEffect, useRef } from 'react'

import { SafeProvider, useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useConnect, useConnection, useConnectors, useReconnect, WagmiProvider } from 'wagmi'

import { wagmiAdapter } from './config'

const queryClient = new QueryClient()

interface Web3ProviderProps {
  children: ReactNode
}

function ReconnectOnMount(): null {
  const { mutate: reconnect } = useReconnect()
  const didReconnect = useRef(false)

  useEffect(() => {
    if (didReconnect.current) return
    didReconnect.current = true
    reconnect()
  }, [reconnect])

  return null
}

const INJECTED_AUTO_CONNECT_DELAY_MS = 400

/** When the app is opened inside an in-app browser (e.g. MetaMask iOS), connect to the injected provider so the user stays connected. */
function InjectedBrowserAutoConnect(): null {
  const { address, isConnected } = useConnection()
  const connectors = useConnectors()
  const { mutateAsync: connect } = useConnect()
  const didTryInjected = useRef(false)

  useEffect(() => {
    if (isConnected || !!address || didTryInjected.current) return
    if (typeof window === 'undefined' || !window.ethereum) return

    const timeoutId = setTimeout(() => {
      if (didTryInjected.current) return
      const injectedConnector = connectors.find(
        (c) =>
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
  const { mutate: connect } = useConnect()
  const connectors = useConnectors()
  const { connected: isConnectedThroughSafeApp } = useSafeAppsSDK()

  useEffect(() => {
    const connectToSafe = async (): Promise<void> => {
      if (currentConnector?.id === 'safe') {
        return
      }
      const safeConnector = connectors.find((connector) => connector.id === 'safe')
      if (isConnectedThroughSafeApp && safeConnector) {
        await connect({ connector: safeConnector })
      }
    }
    connectToSafe()
  }, [currentConnector, isConnectedThroughSafeApp, connect, connectors])

  return children
}
