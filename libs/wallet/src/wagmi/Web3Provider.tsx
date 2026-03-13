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

export function Web3Provider({ children }: Web3ProviderProps): React.ReactNode {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SafeProvider>
          <ReconnectOnMount />
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
