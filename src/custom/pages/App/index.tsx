import React from 'react'
import AppMod from './AppMod'
import styled from 'styled-components'
import { RedirectPathToSwapOnly, RedirectToSwap } from 'pages/Swap/redirects'
import { Route, Switch } from 'react-router-dom'
import Swap from 'pages/Swap'
import PrivacyPolicy from 'pages/PrivacyPolicy'
import CookiePolicy from 'pages/CookiePolicy'
import TermsAndConditions from 'pages/TermsAndConditions'
import About from 'pages/About'
import Profile from 'pages/Profile'
import Faq from 'pages/Faq'
import NotFound from 'pages/NotFound'
import CowGame from 'pages/CowGame'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { version } from '@src/../package.json'
import { environmentName } from 'utils/environments'

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN
const SENTRY_TRACES_SAMPLE_RATE = process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE

if (SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    release: 'CowSwap@v' + version,
    environment: environmentName,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE ? Number(SENTRY_TRACES_SAMPLE_RATE) : 1.0,
  })
}

export const Wrapper = styled(AppMod)``

export const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 120px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0 10px 0;
  `};
`

export default function App() {
  return (
    <Wrapper>
      <Switch>
        <Route exact strict path="/swap" component={Swap} />
        <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
        <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
        <Route exact strict path="/about" component={About} />
        <Route exact strict path="/profile" component={Profile} />
        <Route exact strict path="/faq" component={Faq} />
        <Route exact strict path="/play" component={CowGame} />
        <Route exact strict path="/privacy-policy" component={PrivacyPolicy} />
        <Route exact strict path="/cookie-policy" component={CookiePolicy} />
        <Route exact strict path="/terms-and-conditions" component={TermsAndConditions} />
        <Route exact strict path="/" component={RedirectPathToSwapOnly} />
        <Route component={NotFound} />
      </Switch>
    </Wrapper>
  )
}
