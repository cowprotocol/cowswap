import { ReactNode, Suspense } from 'react'

import { GlobalCoWDAOStyles } from '@cowprotocol/ui'

import { createGlobalStyle, css } from 'styled-components/macro'
import { ThemeProvider } from 'theme'

import ErrorBoundary from 'legacy/components/ErrorBoundary'

import { LoadingApp } from 'common/pure/LoadingApp'
import { CoWDAOFonts } from 'common/styles/CoWDAOFonts'
import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { AppContainer } from '../AppContainer'

const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts)
const LocalGlobalStyles = createGlobalStyle(
  () => css`
    body {
      background: transparent;
    }
  `,
)

export function App(): ReactNode {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingApp />}>
        <RedirectAnySwapAffectedUsers />
        <ThemeProvider />
        <GlobalStyles />
        <LocalGlobalStyles />

        <AppContainer />
      </Suspense>
    </ErrorBoundary>
  )
}
