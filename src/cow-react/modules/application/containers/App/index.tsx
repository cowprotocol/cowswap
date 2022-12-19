import { initializeAnalytics } from 'components/AmplitudeAnalytics'
import TopLevelModals from 'components/TopLevelModals'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import {
  Route,
  // useLocation
} from 'react-router-dom'
import ErrorBoundary from 'components/ErrorBoundary'
import Header from 'components/Header'

import DarkModeQueryParamReader from 'theme'

import ReferralLinkUpdater from 'state/affiliate/updater'
import URLWarning from 'components/Header/URLWarning'
import Footer from 'components/Footer'

import RedirectAnySwapAffectedUsers from '@cow/pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'
import { RoutesApp } from './RoutesApp'
import * as styledEl from './styled'

// Winter Theme
import { useContext } from 'react'
import { ThemeContext } from 'styled-components/macro'
import Snowfall from 'react-snowfall'
import { transparentize } from 'polished'

export function App() {
  // const location = useLocation()

  // Winter Theme
  const theme = useContext(ThemeContext)

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
        <styledEl.BodyWrapper
        // location={location}
        >
          <TopLevelModals />
          <ReferralLinkUpdater />
          <RoutesApp />
          <styledEl.Marginer />
        </styledEl.BodyWrapper>
        <styledEl.FooterWrapper>
          <Footer />

          {/* Winter Theme */}
          <Snowfall color={transparentize(0.7, theme.text1)} snowflakeCount={50} />
        </styledEl.FooterWrapper>
      </styledEl.AppWrapper>
    </ErrorBoundary>
  )
}
