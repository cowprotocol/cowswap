import { ReactNode } from 'react'

import ErrorBoundary from 'legacy/components/ErrorBoundary'
import { TopLevelModals } from 'legacy/components/TopLevelModals'

import { InvalidCoWShedSetup } from 'modules/accountProxy'

import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { RoutesApp } from './RoutesApp'

import { AppContainer } from '../AppContainer/AppContainer.container'

export function App(): ReactNode {
  return (
    <ErrorBoundary>
      <RedirectAnySwapAffectedUsers />
      <InvalidCoWShedSetup />

      <AppContainer>
        <TopLevelModals />
        <RoutesApp />
      </AppContainer>
    </ErrorBoundary>
  )
}
