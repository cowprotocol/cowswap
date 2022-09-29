import { initializeAnalytics } from 'components/AmplitudeAnalytics'
import TopLevelModals from 'components/TopLevelModals'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { Route, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import ErrorBoundary from 'components/ErrorBoundary'
import Header from 'components/Header'
import Polling from 'components/Header/Polling'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

import { Routes } from 'constants/routes'

import DarkModeQueryParamReader from 'theme'

import ReferralLinkUpdater from 'state/affiliate/updater'
import URLWarning from 'components/Header/URLWarning'
import Footer from 'components/Footer'
import * as CSS from 'csstype'

import { version } from '@src/../package.json'
import { environmentName } from 'utils/environments'
import { SENTRY_IGNORED_GP_QUOTE_ERRORS } from 'cow-react/api/gnosisProtocol/errors/QuoteError'
import RedirectAnySwapAffectedUsers from 'cow-react/pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'
import { RoutesApp } from './RoutesApp'

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN
const SENTRY_TRACES_SAMPLE_RATE = process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE

if (SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    release: 'CowSwap@v' + version,
    environment: environmentName,
    ignoreErrors: [...SENTRY_IGNORED_GP_QUOTE_ERRORS],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE ? Number(SENTRY_TRACES_SAMPLE_RATE) : 1.0,
  })
}

const AppWrapper = styled.div<Partial<CSS.Properties>>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  // MOD
  min-height: 100vh;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const FooterWrapper = styled(HeaderWrapper)`
  z-index: 1;
  width: auto;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

const BodyWrapper = styled.div<{ location: { pathname: string } }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding-top: 10vh;
  align-items: center;
  justify-content: center;
  flex: auto;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToExtraLarge`
    padding-top: 5vh;
    align-items: flex-start;
  `}

  ${({ theme, location }) => theme.mediaWidth.upToMedium`
    padding: ${[Routes.SWAP].includes(location.pathname as Routes) ? '0 0 16px' : '0 16px 16px'};
  `}
`

export function App() {
  const location = useLocation()

  initializeAnalytics()

  return (
    <ErrorBoundary>
      <RedirectAnySwapAffectedUsers />
      <Route component={DarkModeQueryParamReader} />
      <Route component={ApeModeQueryParamReader} />
      <AppWrapper>
        <URLWarning />
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        <BodyWrapper location={location}>
          <Polling />
          <TopLevelModals />
          <ReferralLinkUpdater />
          <RoutesApp />
          <Marginer />
        </BodyWrapper>
        <FooterWrapper>
          <Footer />
        </FooterWrapper>
      </AppWrapper>
    </ErrorBoundary>
  )
}
