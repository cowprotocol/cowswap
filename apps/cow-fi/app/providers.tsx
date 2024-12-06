'use client'

import { apolloClient } from '../services/uniswap-price/apollo-client'
import { WithLDProvider } from '@/components/WithLDProvider'
import { ThemeProvider } from '../theme'
import { CowAnalyticsProvider } from '@cowprotocol/analytics'
import { cowAnalytics } from '../modules/analytics'
import { ApolloProvider } from '@apollo/client'
import GlobalStyles from '@/styles/global.styles'
import { useState } from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components/macro'
import { useServerInsertedHTML } from 'next/navigation'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <>
        <GlobalStyles />
        <ApolloProvider client={apolloClient}>
          <WithLDProvider>
            <ThemeProvider>
              <CowAnalyticsProvider cowAnalytics={cowAnalytics}>{children}</CowAnalyticsProvider>
            </ThemeProvider>
          </WithLDProvider>
        </ApolloProvider>
      </>
    </StyledComponentsRegistry>
  )
}

function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement()

    // Types are out of date, clearTag is not defined.
    // See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/65021
    ;(styledComponentsStyleSheet.instance as any).clearTag()

    return <>{styles}</>
  })

  if (typeof window !== 'undefined') return <>{children}</>

  return <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>{children}</StyleSheetManager>
}
