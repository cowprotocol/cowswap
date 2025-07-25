import { ReactNode, Suspense } from 'react'

import ErrorBoundary from 'legacy/components/ErrorBoundary'
import { TopLevelModals } from 'legacy/components/TopLevelModals'

import { InvalidCoWShedSetup } from 'modules/cowShed'

import { LoadingApp } from 'common/pure/LoadingApp'
import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { RoutesApp } from './RoutesApp'

import { AppContainer } from '../AppContainer'

export function App(): ReactNode {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingApp />}>
        <RedirectAnySwapAffectedUsers />
        <InvalidCoWShedSetup />

        <AppContainer>
          <TopLevelModals />
          <RoutesApp />
        </AppContainer>
      </Suspense>
    </ErrorBoundary>
  )
}
