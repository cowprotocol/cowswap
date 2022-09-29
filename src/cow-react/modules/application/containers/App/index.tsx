import 'cow-react/utils/sentry'

import { initializeAnalytics } from 'components/AmplitudeAnalytics'
import TopLevelModals from 'components/TopLevelModals'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { Route, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import ErrorBoundary from 'components/ErrorBoundary'
import Header from 'components/Header'
import Polling from 'components/Header/Polling'

import { Routes } from 'constants/routes'

import DarkModeQueryParamReader from 'theme'

import ReferralLinkUpdater from 'state/affiliate/updater'
import URLWarning from 'components/Header/URLWarning'
import Footer from 'components/Footer'
import * as CSS from 'csstype'

import RedirectAnySwapAffectedUsers from 'cow-react/pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'
import { RoutesApp } from './RoutesApp'

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
