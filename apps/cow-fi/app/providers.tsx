'use client'

import { apolloClient } from '../services/uniswap-price/apollo-client'
import { WithLDProvider } from '@/components/WithLDProvider'
import { ThemeProvider } from '../theme'
import { CowAnalyticsProvider } from '@cowprotocol/analytics'
import { cowAnalytics } from '../modules/analytics'
import { ApolloProvider } from '@apollo/client'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <WithLDProvider>
        <ThemeProvider>
          <CowAnalyticsProvider cowAnalytics={cowAnalytics}>{children}</CowAnalyticsProvider>
        </ThemeProvider>
      </WithLDProvider>
    </ApolloProvider>
  )
}
