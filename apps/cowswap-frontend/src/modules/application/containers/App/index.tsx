import { ReactNode } from 'react'

import { TopLevelModals } from 'legacy/components/TopLevelModals'

import { InvalidCoWShedSetup } from 'modules/accountProxy'

import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { RoutesApp } from './RoutesApp'

import { AppContainer } from '../AppContainer/AppContainer.container'

export function App(): ReactNode {
  return (
    <>
      <RedirectAnySwapAffectedUsers />
      <InvalidCoWShedSetup />

      <AppContainer>
        <TopLevelModals />
        <RoutesApp />
      </AppContainer>
    </>
  )
}
