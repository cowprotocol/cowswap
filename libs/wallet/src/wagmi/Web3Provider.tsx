import { ReactNode, useEffect } from 'react'

import { SafeProvider, useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useConnect, useConnection, useConnectors, WagmiProvider } from 'wagmi'

import { wagmiAdapter } from './config'

const queryClient = new QueryClient()

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps): React.ReactNode {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SafeProvider>
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
