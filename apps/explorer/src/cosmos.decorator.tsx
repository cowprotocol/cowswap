import React, { PropsWithChildren } from 'react'

import { CowAnalyticsProvider } from '@cowprotocol/analytics'

import { MemoryRouter } from 'react-router'

// Minimal decorator - temporarily remove problematic imports if they block loading
import { GlobalStyle as ExplorerGlobalStyle } from './explorer/styled'
import { GlobalStateContext } from './hooks/useGlobalState'
import { StaticGlobalStyle, ThemedGlobalStyle } from './theme/styles/global'
import { ThemeProvider } from './theme/ThemeProvider'
import { Network } from './types'

const MockCowAnalyticsProvider = ({ children }: PropsWithChildren) => (
  <CowAnalyticsProvider cowAnalytics={{ sendEvent: () => {} } as any}>{children}</CowAnalyticsProvider>
)

const mockGlobalStateContextValue: [any, React.Dispatch<any>] = [{ networkId: Network.MAINNET }, () => {}]

const GlobalDecorator: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <MemoryRouter>
      <GlobalStateContext.Provider value={mockGlobalStateContextValue}>
        <MockCowAnalyticsProvider>
          <ThemeProvider>
            <StaticGlobalStyle />
            <ThemedGlobalStyle />
            <ExplorerGlobalStyle />
            {children}
          </ThemeProvider>
        </MockCowAnalyticsProvider>
      </GlobalStateContext.Provider>
    </MemoryRouter>
  )
}

export default GlobalDecorator
