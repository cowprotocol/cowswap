/* eslint-disable react/display-name */
import AppMod from './AppMod'
import styled from 'styled-components/macro'
import { RedirectPathToSwapOnly, RedirectToSwap } from 'pages/Swap/redirects'
import { Suspense, lazy } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import AnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { version } from '@src/../package.json'
import { environmentName } from 'utils/environments'
import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'
import { SENTRY_IGNORED_GP_QUOTE_ERRORS } from 'api/gnosisProtocol/errors/QuoteError'

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN
const SENTRY_TRACES_SAMPLE_RATE = process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE

const Swap = lazy(() => import(/* webpackPrefetch: true,  webpackChunkName: "swap" */ 'pages/Swap'))
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "privacy_policy" */ 'pages/PrivacyPolicy'))
const CookiePolicy = lazy(() => import(/* webpackChunkName: "cookie_policy" */ 'pages/CookiePolicy'))
const TermsAndConditions = lazy(() => import(/* webpackChunkName: "terms" */ 'pages/TermsAndConditions'))
const About = lazy(() => import(/* webpackChunkName: "about" */ 'pages/About'))
const Profile = lazy(() => import(/* webpackChunkName: "profile" */ 'pages/Profile'))
const NotFound = lazy(() => import(/* webpackChunkName: "not_found" */ 'pages/error/NotFound'))
const CowRunner = lazy(() => import(/* webpackChunkName: "cow_runner" */ 'pages/games/CowRunner'))
const MevSlicer = lazy(() => import(/* webpackChunkName: "mev_slicer" */ 'pages/games/MevSlicer'))

// FAQ pages
const Faq = lazy(() => import(/* webpackChunkName: "faq" */ 'pages/Faq'))
const ProtocolFaq = lazy(() => import(/* webpackChunkName: "protocol_faq" */ 'pages/Faq/ProtocolFaq'))
const TokenFaq = lazy(() => import(/* webpackChunkName: "token_faq" */ 'pages/Faq/TokenFaq'))
const TradingFaq = lazy(() => import(/* webpackChunkName: "trading_faq" */ 'pages/Faq/TradingFaq'))
const AffiliateFaq = lazy(() => import(/* webpackChunkName: "affiliate_faq" */ 'pages/Faq/AffiliateFaq'))

// Account pages
const Account = lazy(() => import(/* webpackChunkName: "account" */ 'pages/Account'))
const TokensOverview = lazy(() => import(/* webpackChunkName: "tokens_overview" */ 'pages/Account/Tokens'))
const TokenSingle = lazy(() => import(/* webpackChunkName: "token_single" */ 'pages/Account/Tokens/TokenSingle'))
const Governance = lazy(() => import(/* webpackChunkName: "governance" */ 'pages/Account/Governance'))
const Affiliate = lazy(() => import(/* webpackChunkName: "affiliate" */ 'pages/Account/Affiliate'))

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

export const Wrapper = styled(AppMod)``

export const BodyWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding-top: 10vh;
  align-items: center;
  justify-content: center;
  flex: auto;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0 10px 0;
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraLarge`
    padding-top: 5vh;
    align-items: flex-start;
  `}
`

export const LoadingWrapper = styled.div`
  animation: blinker 2s linear infinite;

  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
`

function createRedirectExternal(url: string) {
  return () => {
    window.location.replace(url)
    return null
  }
}

const Loading = <LoadingWrapper>Loading...</LoadingWrapper>

export default function App() {
  return (
    <>
      <RedirectAnySwapAffectedUsers />
      <Wrapper>
        <Suspense fallback={Loading}>
          <Switch>
            <Redirect from="/claim" to="/profile" />
            <Route exact strict path="/swap" component={Swap} />
            <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
            <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
            <Route exact strict path="/about" component={About} />
            <Route exact strict path="/profile" component={Profile} />

            <Route exact strict path="/account" component={Account} />
            <Route exact strict path="/account/tokens" component={TokensOverview} />
            <Route exact strict path="/account/tokens/:address" component={TokenSingle} />
            <Route exact strict path="/account/governance" component={Governance} />
            <Route exact strict path="/account/affiliate" component={Affiliate} />

            <Route exact path="/faq" component={Faq} />
            <Route exact strict path="/faq/protocol" component={ProtocolFaq} />
            <Route exact strict path="/faq/token" component={TokenFaq} />
            <Route exact strict path="/faq/trading" component={TradingFaq} />
            <Route exact strict path="/faq/affiliate" component={AffiliateFaq} />
            <Route exact strict path="/play/cow-runner" component={CowRunner} />
            <Route exact strict path="/play/mev-slicer" component={MevSlicer} />
            <Route exact strict path="/anyswap-affected-users" component={AnySwapAffectedUsers} />
            <Route exact strict path="/privacy-policy" component={PrivacyPolicy} />
            <Route exact strict path="/cookie-policy" component={CookiePolicy} />
            <Route exact strict path="/terms-and-conditions" component={TermsAndConditions} />
            <Route exact strict path="/chat" component={createRedirectExternal('https://chat.cowswap.exchange')} />
            <Route exact strict path="/docs" component={createRedirectExternal('https://docs.cow.fi')} />
            <Route
              exact
              strict
              path="/stats"
              component={createRedirectExternal('https://dune.xyz/gnosis.protocol/Gnosis-Protocol-V2')}
            />
            <Route
              exact
              strict
              path="/twitter"
              component={createRedirectExternal('https://twitter.com/MEVprotection')}
            />
            <Route exact strict path="/" component={RedirectPathToSwapOnly} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </Wrapper>
    </>
  )
}
