'use client'

import type { ReactNode } from 'react'

import type { QueryClient } from '@tanstack/query-core'
import { QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { wagmiConfig } from './appKit'

interface WalletProviderProps {
  queryClient: QueryClient
  children: ReactNode
}

export function WalletProvider({ queryClient, children }: WalletProviderProps): ReactNode {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
