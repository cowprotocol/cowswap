import { ReactNode, Suspense } from 'react'

import { GlobalCoWDAOStyles } from '@cowprotocol/ui'

import { ThemeProvider } from 'theme'

import ErrorBoundary from 'legacy/components/ErrorBoundary'

import { LoadingApp } from 'common/pure/LoadingApp'
import { CoWDAOFonts } from 'common/styles/CoWDAOFonts'
import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { AppContainer } from '../AppContainer'

const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts, 'transparent')

export function App(): ReactNode {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingApp />}>
        <RedirectAnySwapAffectedUsers />
        <ThemeProvider />
        <GlobalStyles />

        <AppContainer />
      </Suspense>
    </ErrorBoundary>
  )
}
