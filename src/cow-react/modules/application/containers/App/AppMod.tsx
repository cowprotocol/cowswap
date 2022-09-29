import { initializeAnalytics } from 'components/AmplitudeAnalytics'
import Loader from 'components/Loader'
import TopLevelModals from 'components/TopLevelModals'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { Suspense, lazy } from 'react'
import { Route, Switch, useLocation, Redirect } from 'react-router-dom'
import styled from 'styled-components/macro'
import ErrorBoundary from 'components/ErrorBoundary'
import Header from 'components/Header'
import Polling from 'components/Header/Polling'
import { useAnalyticsReporter } from 'components/analytics'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

import { RedirectPathToSwapOnly, RedirectToSwap } from 'pages/Swap/redirects'
import { Routes } from 'constants/routes'

import AnySwapAffectedUsers from 'cow-react/pages/error/AnySwapAffectedUsers'
import { DISCORD_LINK, DOCS_LINK, DUNE_DASHBOARD_LINK, TWITTER_LINK } from 'constants/index'
import { Loading } from 'components/FlashingLoading'

import Account from 'cow-react/pages/Account'
import Swap from 'cow-react/pages/Swap'
import { NewSwapPage } from 'cow-react/pages/NewSwap'

import DarkModeQueryParamReader from 'theme'

import ReferralLinkUpdater from 'state/affiliate/updater'
import URLWarning from 'components/Header/URLWarning'
import Footer from 'components/Footer'
import * as CSS from 'csstype'

import { version } from '@src/../package.json'
import { environmentName, isBarn } from 'utils/environments'
import { SENTRY_IGNORED_GP_QUOTE_ERRORS } from 'cow-react/api/gnosisProtocol/errors/QuoteError'

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN
const SENTRY_TRACES_SAMPLE_RATE = process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE

const isNewSwapEnabled = localStorage.getItem('enableNewSwap') || isBarn

// Async routes
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "privacy_policy" */ 'cow-react/pages/PrivacyPolicy'))
const LimitOrders = lazy(() => import(/* webpackChunkName: "limit_orders" */ 'cow-react/pages/LimitOrders'))
const CookiePolicy = lazy(() => import(/* webpackChunkName: "cookie_policy" */ 'cow-react/pages/CookiePolicy'))
const TermsAndConditions = lazy(() => import(/* webpackChunkName: "terms" */ 'cow-react/pages/TermsAndConditions'))
const About = lazy(() => import(/* webpackChunkName: "about" */ 'cow-react/pages/About'))
const NotFound = lazy(() => import(/* webpackChunkName: "not_found" */ 'cow-react/pages/error/NotFound'))
const CowRunner = lazy(() => import(/* webpackChunkName: "cow_runner" */ 'cow-react/pages/games/CowRunner'))
const MevSlicer = lazy(() => import(/* webpackChunkName: "mev_slicer" */ 'cow-react/pages/games/MevSlicer'))

// FAQ pages
const Faq = lazy(() => import(/* webpackChunkName: "faq" */ 'cow-react/pages/Faq'))
const ProtocolFaq = lazy(() => import(/* webpackChunkName: "protocol_faq" */ 'cow-react/pages/Faq/ProtocolFaq'))
const TokenFaq = lazy(() => import(/* webpackChunkName: "token_faq" */ 'cow-react/pages/Faq/TokenFaq'))
const TradingFaq = lazy(() => import(/* webpackChunkName: "trading_faq" */ 'cow-react/pages/Faq/TradingFaq'))
const AffiliateFaq = lazy(() => import(/* webpackChunkName: "affiliate_faq" */ 'cow-react/pages/Faq/AffiliateFaq'))

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

function createRedirectExternal(url: string) {
  return () => {
    window.location.replace(url)
    return null
  }
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

export default function App() {
  const location = useLocation()
  useAnalyticsReporter(location)

  initializeAnalytics()

  return (
    <ErrorBoundary>
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
          <Suspense fallback={<Loader />}>
            <Switch>
              {/* Optimistic routes */}
              <Route strict path={Routes.ACCOUNT} component={Account} />
              {/* Lazy routes */}
              <Suspense fallback={Loading}>
                <Switch>
                  <Redirect from="/claim" to={Routes.ACCOUNT} />
                  <Redirect from="/profile" to={Routes.ACCOUNT} />
                  <Route exact strict path={Routes.SWAP} component={isNewSwapEnabled ? NewSwapPage : Swap} />
                  <Route exact strict path={Routes.LIMIT_ORDER} component={LimitOrders} />
                  <Route exact strict path={Routes.SWAP_OUTPUT_CURRENCY} component={RedirectToSwap} />
                  <Route exact strict path={Routes.SEND} component={RedirectPathToSwapOnly} />
                  <Route exact strict path={Routes.ABOUT} component={About} />

                  <Route exact path={Routes.FAQ} component={Faq} />
                  <Route exact strict path={Routes.FAQ_PROTOCOL} component={ProtocolFaq} />
                  <Route exact strict path={Routes.FAQ_TOKEN} component={TokenFaq} />
                  <Route exact strict path={Routes.FAQ_TRADING} component={TradingFaq} />
                  <Route exact strict path={Routes.FAQ_AFFILIATE} component={AffiliateFaq} />
                  <Route exact strict path={Routes.PLAY_COWRUNNER} component={CowRunner} />
                  <Route exact strict path={Routes.PLAY_MEVSLICER} component={MevSlicer} />
                  <Route exact strict path={Routes.ANYSWAP_AFFECTED} component={AnySwapAffectedUsers} />
                  <Route exact strict path={Routes.PRIVACY_POLICY} component={PrivacyPolicy} />
                  <Route exact strict path={Routes.COOKIE_POLICY} component={CookiePolicy} />
                  <Route exact strict path={Routes.TERMS_CONDITIONS} component={TermsAndConditions} />
                  <Route exact strict path={Routes.CHAT} component={createRedirectExternal(DISCORD_LINK)} />
                  <Route exact strict path={Routes.DOCS} component={createRedirectExternal(DOCS_LINK)} />
                  <Route exact strict path={Routes.STATS} component={createRedirectExternal(DUNE_DASHBOARD_LINK)} />
                  <Route exact strict path={Routes.TWITTER} component={createRedirectExternal(TWITTER_LINK)} />
                  <Route exact strict path={Routes.HOME} component={RedirectPathToSwapOnly} />
                  <Route component={NotFound} />
                </Switch>
              </Suspense>
            </Switch>
          </Suspense>
          <Marginer />
        </BodyWrapper>
        <FooterWrapper>
          <Footer />
        </FooterWrapper>
      </AppWrapper>
    </ErrorBoundary>
  )
}
