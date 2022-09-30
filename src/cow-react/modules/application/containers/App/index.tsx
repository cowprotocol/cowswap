import { initializeAnalytics } from 'components/AmplitudeAnalytics'
import TopLevelModals from 'components/TopLevelModals'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { Route, useLocation } from 'react-router-dom'
import ErrorBoundary from 'components/ErrorBoundary'
import Header from 'components/Header'
import Polling from 'components/Header/Polling'

import DarkModeQueryParamReader from 'theme'

import ReferralLinkUpdater from 'state/affiliate/updater'
import URLWarning from 'components/Header/URLWarning'
import Footer from 'components/Footer'

import RedirectAnySwapAffectedUsers from 'cow-react/pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'
import { RoutesApp } from './RoutesApp'
import * as styledEl from './styled'

export function App() {
  const location = useLocation()

  initializeAnalytics()

  return (
    <ErrorBoundary>
      <RedirectAnySwapAffectedUsers />
      <Route component={DarkModeQueryParamReader} />
      <Route component={ApeModeQueryParamReader} />
      <styledEl.AppWrapper>
        <URLWarning />
        <styledEl.HeaderWrapper>
          <Header />
        </styledEl.HeaderWrapper>
        <styledEl.BodyWrapper location={location}>
          <Polling />
          <TopLevelModals />
          <ReferralLinkUpdater />
          <RoutesApp />
          <styledEl.Marginer />
        </styledEl.BodyWrapper>
        <styledEl.FooterWrapper>
          <Footer />
        </styledEl.FooterWrapper>
      </styledEl.AppWrapper>
    </ErrorBoundary>
  )
}
