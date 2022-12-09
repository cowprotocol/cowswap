import Loader from 'components/Loader'
import { Suspense, lazy } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import { RedirectPathToSwapOnly } from 'pages/Swap/redirects'
import { Routes } from '@cow/constants/routes'

import AnySwapAffectedUsers from '@cow/pages/error/AnySwapAffectedUsers'
import { DISCORD_LINK, DOCS_LINK, DUNE_DASHBOARD_LINK, TWITTER_LINK } from 'constants/index'
import { Loading } from 'components/FlashingLoading'

import Account from '@cow/pages/Account'
import { NewSwapPage, NewSwapPageRedirect } from '@cow/pages/NewSwap'

// Async routes
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "privacy_policy" */ '@cow/pages/PrivacyPolicy'))
const LimitOrders = lazy(() => import(/* webpackChunkName: "limit_orders" */ '@cow/pages/LimitOrders'))
const CookiePolicy = lazy(() => import(/* webpackChunkName: "cookie_policy" */ '@cow/pages/CookiePolicy'))
const TermsAndConditions = lazy(() => import(/* webpackChunkName: "terms" */ '@cow/pages/TermsAndConditions'))
const About = lazy(() => import(/* webpackChunkName: "about" */ '@cow/pages/About'))
const NotFound = lazy(() => import(/* webpackChunkName: "not_found" */ '@cow/pages/error/NotFound'))
const CowRunner = lazy(() => import(/* webpackChunkName: "cow_runner" */ '@cow/pages/games/CowRunner'))
const MevSlicer = lazy(() => import(/* webpackChunkName: "mev_slicer" */ '@cow/pages/games/MevSlicer'))

// FAQ pages
const Faq = lazy(() => import(/* webpackChunkName: "faq" */ '@cow/pages/Faq'))
const ProtocolFaq = lazy(() => import(/* webpackChunkName: "protocol_faq" */ '@cow/pages/Faq/ProtocolFaq'))
const TokenFaq = lazy(() => import(/* webpackChunkName: "token_faq" */ '@cow/pages/Faq/TokenFaq'))
const TradingFaq = lazy(() => import(/* webpackChunkName: "trading_faq" */ '@cow/pages/Faq/TradingFaq'))
const AffiliateFaq = lazy(() => import(/* webpackChunkName: "affiliate_faq" */ '@cow/pages/Faq/AffiliateFaq'))
const LimitOrdersFaq = lazy(() => import(/* webpackChunkName: "limit_orders_faq" */ '@cow/pages/Faq/LimitOrdersFaq'))

function createRedirectExternal(url: string) {
  return () => {
    window.location.replace(url)
    return null
  }
}

export function RoutesApp() {
  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        {/* Optimistic routes */}
        <Route strict path={Routes.ACCOUNT} component={Account} />
        {/* Lazy routes */}
        <Suspense fallback={Loading}>
          <Switch>
            <Redirect from="/claim" to={Routes.ACCOUNT} />
            <Redirect from="/profile" to={Routes.ACCOUNT} />
            {/*Redirect from the old URL format to a new one*/}
            <Route exact strict path="/swap" component={NewSwapPageRedirect} />
            <Route exact path={Routes.SWAP} component={NewSwapPage} />
            <Route exact path={Routes.LIMIT_ORDER} component={LimitOrders} />
            <Route exact strict path={Routes.SEND} component={RedirectPathToSwapOnly} />
            <Route exact strict path={Routes.ABOUT} component={About} />

            <Route exact path={Routes.FAQ} component={Faq} />
            <Route exact strict path={Routes.FAQ_PROTOCOL} component={ProtocolFaq} />
            <Route exact strict path={Routes.FAQ_TOKEN} component={TokenFaq} />
            <Route exact strict path={Routes.FAQ_TRADING} component={TradingFaq} />
            <Route exact strict path={Routes.FAQ_AFFILIATE} component={AffiliateFaq} />
            <Route exact strict path={Routes.FAQ_LIMIT_ORDERS} component={LimitOrdersFaq} />
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
  )
}
