import { ReactNode } from 'react'

import ErrorBoundary from 'legacy/components/ErrorBoundary'
import { TopLevelModals } from 'legacy/components/TopLevelModals'

import { InvalidCoWShedSetup } from 'modules/accountProxy'

import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { RoutesApp } from './RoutesApp'

import { AppContainer } from '../AppContainer/AppContainer.container'
import { React310RecoveryErrorBoundary } from '../React310RecoveryErrorBoundary/React310RecoveryErrorBoundary.container'

export function App(): ReactNode {
  return (
    <ErrorBoundary>
      <React310RecoveryErrorBoundary>
        <RedirectAnySwapAffectedUsers />
        <InvalidCoWShedSetup />

        <AppContainer>
          <TopLevelModals />
          <RoutesApp />
        </AppContainer>
      </React310RecoveryErrorBoundary>
    </ErrorBoundary>
  )
}
