import { ReactNode } from 'react'

import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { wagmiAdapter } from './config'

const queryClient = new QueryClient()

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps): React.ReactNode {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SafeProvider>{children}</SafeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
