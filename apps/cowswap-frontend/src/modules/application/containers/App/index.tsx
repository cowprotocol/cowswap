import { ReactNode, Suspense } from 'react'

import ErrorBoundary from 'legacy/components/ErrorBoundary'

import { LoadingApp } from 'common/pure/LoadingApp'
import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { AppContainer } from '../AppContainer'

export function App(): ReactNode {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingApp />}>
        <RedirectAnySwapAffectedUsers />

        <AppContainer />
      </Suspense>
    </ErrorBoundary>
  )
}
