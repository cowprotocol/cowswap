'use client'

import { type ReactNode, useEffect } from 'react'

import type { QueryClient } from '@tanstack/query-core'
import { QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { appKit, wagmiConfig } from './appKit'

import { useIsDarkTheme } from '@/shared/lib/theme'

interface WalletProviderProps {
  queryClient: QueryClient
  children: ReactNode
}

export function WalletProvider({ queryClient, children }: WalletProviderProps): ReactNode {
  const isDark = useIsDarkTheme()

  useEffect(() => {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()

    // Without an explicit mode the modal follows the system scheme, not the app theme
    appKit.setThemeMode(isDark ? 'dark' : 'light')
    appKit.setThemeVariables({ '--apkt-accent': accent })
  }, [isDark])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
