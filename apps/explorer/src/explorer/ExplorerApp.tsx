import React from 'react'

import {
  CowAnalyticsProvider,
  initGtm,
  initPixelAnalytics,
  useAnalyticsReporter,
  WebVitalsAnalytics,
} from '@cowprotocol/analytics'
import { CHAIN_INFO_ARRAY } from '@cowprotocol/common-const'

import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation } from 'react-router'

import { WithLDProvider } from './components/common/WithLDProvider'
import { Header } from './layout/Header'
import { INITIAL_STATE, rootReducer } from './state'
import { GlobalStyle, MainWrapper } from './styled'

import { version } from '../../package.json'
import { GenericLayout } from '../components/layout'
import { withGlobalContext } from '../hooks/useGlobalState'
import { RedirectMainnet, RedirectXdai, useNetworkId } from '../state/network'
import { NetworkUpdater } from '../state/network/NetworkUpdater'
import { environmentName } from '../utils/env'

// Initialize analytics instances
const cowAnalytics = initGtm()
const pixelAnalytics = initPixelAnalytics()
const webVitalsAnalytics = new WebVitalsAnalytics(cowAnalytics)

const SENTRY_DSN = process.env.REACT_APP_EXPLORER_SENTRY_DSN
const SENTRY_TRACES_SAMPLE_RATE = process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    release: 'gp-explorer@v' + version,
    environment: environmentName,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE ? Number(SENTRY_TRACES_SAMPLE_RATE) : 1.0,
  })
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Router: typeof BrowserRouter & typeof HashRouter = (window as any).IS_IPFS ? HashRouter : BrowserRouter

const NotFound = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Extra_routes_chunk"*/
      './pages/NotFound'
    ),
)

const AppDataDetails = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Metadata_chunk"*/
      './pages/AppData'
    ),
)

const SearchNotFound = React.lazy(
  () =>
    import(
      /* webpackChunkName: "SearchNotFound_chunk"*/
      './pages/SearchNotFound'
    ),
)

const Home = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Trade_chunk"*/
      './pages/Home'
    ),
)

const Order = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Order_chunk"*/
      './pages/Order'
    ),
)

const UserDetails = React.lazy(
  () =>
    import(
      /* webpackChunkName: "UserDetails_chunk"*/
      './pages/UserDetails'
    ),
)

const TransactionDetails = React.lazy(
  () =>
    import(
      /* webpackChunkName: "TransactionDetails_chunk"*/
      './pages/TransactionDetails'
    ),
)

/**
 * Update the global state
 */
function StateUpdaters(): React.ReactNode {
  return <NetworkUpdater />
}

const networkPrefixes = CHAIN_INFO_ARRAY.map((info) => info.urlAlias)

/** App content */

const AppContent = (): React.ReactNode => {
  const chainId = useNetworkId()
  useAnalyticsReporter({
    account: undefined, // Explorer doesn't have wallet functionality
    walletName: undefined, // Explorer doesn't have wallet functionality
    chainId: chainId || undefined,
    cowAnalytics,
    pixelAnalytics,
    webVitalsAnalytics,
  })

  const location = useLocation()
  const { pathname: path } = location
  const prefix = path === '' ? '' : `${path.split('/')[1]}`
  const pathPrefix = networkPrefixes.includes(prefix) ? `/${prefix}` : '/'

  return (
    <WithLDProvider>
      <GenericLayout header={<Header />}>
        <React.Suspense fallback={null}>
          <Routes>
            <Route path={pathPrefix + '/'} element={<Home />} />
            <Route path={pathPrefix + '/address/'} element={<Navigate to={pathPrefix + '/search/'} />} />
            <Route path={pathPrefix + '/orders/'} element={<Navigate to={pathPrefix + '/search/'} />} />
            <Route path={pathPrefix + '/tx/'} element={<Navigate to={pathPrefix + '/search/'} />} />
            <Route path={pathPrefix + '/orders/:orderId'} element={<Order />} />
            <Route path={pathPrefix + '/address/:address'} element={<UserDetails />} />
            <Route path={pathPrefix + '/tx/:txHash'} element={<TransactionDetails />} />
            <Route path={pathPrefix + '/search/:searchString?'} element={<SearchNotFound />} />
            <Route path={pathPrefix + '/appdata'} element={<AppDataDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </GenericLayout>
    </WithLDProvider>
  )
}

/**
 * Render Explorer App
 */
export const ExplorerApp: React.FC = () => {
  return (
    <CowAnalyticsProvider cowAnalytics={cowAnalytics}>
      <GlobalStyle />
      <MainWrapper>
        <Router basename={process.env.BASE_URL}>
          <StateUpdaters />
          <Routes>
            <Route path="/mainnet" element={<RedirectMainnet />} />
            <Route path="/xdai" element={<RedirectXdai />} />
            <Route path="*" element={<AppContent />} />
          </Routes>
        </Router>
      </MainWrapper>
    </CowAnalyticsProvider>
  )
}

export default withGlobalContext(
  ExplorerApp,
  // Initial State
  INITIAL_STATE,
  rootReducer,
)
