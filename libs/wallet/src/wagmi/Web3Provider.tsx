import { type ReactNode } from 'react'

import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { config } from './config'
import { SafeConnectionHandler } from './SafeConnectionHandler'

const queryClient = new QueryClient()

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps): ReactNode {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SafeProvider>
          <SafeConnectionHandler>{children}</SafeConnectionHandler>
        </SafeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
