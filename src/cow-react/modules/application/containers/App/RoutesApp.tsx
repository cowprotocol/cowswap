import Loader from 'components/Loader'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { RedirectPathToSwapOnly } from 'pages/Swap/redirects'
import { Routes as RoutesEnum } from '@cow/constants/routes'

import AnySwapAffectedUsers from '@cow/pages/error/AnySwapAffectedUsers'
import { DISCORD_LINK, DOCS_LINK, DUNE_DASHBOARD_LINK, TWITTER_LINK } from 'constants/index'
import { Loading } from 'components/FlashingLoading'

import Account, { AccountOverview } from '@cow/pages/Account'
import { SwapPage } from '@cow/pages/Swap'
import { ReactNode } from 'react'

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
const LimitOrdersFaq = lazy(() => import(/* webpackChunkName: "limit_orders_faq" */ '@cow/pages/Faq/LimitOrdersFaq'))
const EthFlowFaq = lazy(() => import(/* webpackChunkName: "eth_flow_faq" */ '@cow/pages/Faq/EthFlowFaq'))

// Account
const AccountTokensOverview = lazy(() => import(/* webpackChunkName: "tokens_overview" */ '@cow/pages/Account/Tokens'))
const AccountNotFound = lazy(() => import(/* webpackChunkName: "affiliate" */ '@cow/pages/error/NotFound'))

function createRedirectExternal(url: string) {
  return () => {
    window.location.replace(url)
    return null
  }
}

type LazyRouteProps = { route: RoutesEnum; element: ReactNode; key?: number }

function LazyRoute({ route, element, key }: LazyRouteProps) {
  return <Route key={key} path={route} element={<Suspense fallback={Loading}>{element}</Suspense>} />
}

const lazyRoutes: LazyRouteProps[] = [
  { route: RoutesEnum.LIMIT_ORDER, element: <LimitOrders /> },
  { route: RoutesEnum.ABOUT, element: <About /> },
  { route: RoutesEnum.FAQ, element: <Faq /> },
  { route: RoutesEnum.FAQ_PROTOCOL, element: <ProtocolFaq /> },
  { route: RoutesEnum.FAQ_TOKEN, element: <TokenFaq /> },
  { route: RoutesEnum.FAQ_TRADING, element: <TradingFaq /> },
  { route: RoutesEnum.FAQ_LIMIT_ORDERS, element: <LimitOrdersFaq /> },
  { route: RoutesEnum.FAQ_ETH_FLOW, element: <EthFlowFaq /> },
  { route: RoutesEnum.PLAY_COWRUNNER, element: <CowRunner /> },
  { route: RoutesEnum.PLAY_MEVSLICER, element: <MevSlicer /> },
  { route: RoutesEnum.PRIVACY_POLICY, element: <PrivacyPolicy /> },
  { route: RoutesEnum.COOKIE_POLICY, element: <CookiePolicy /> },
  { route: RoutesEnum.TERMS_CONDITIONS, element: <TermsAndConditions /> },
]

export function RoutesApp() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/*Account*/}
        <Route path={RoutesEnum.ACCOUNT} element={<Account />}>
          <Route path={RoutesEnum.ACCOUNT} element={<AccountOverview />} />
          <Route path={RoutesEnum.ACCOUNT_TOKENS} element={<AccountTokensOverview />} />
          <Route path="*" element={<AccountNotFound />} />
        </Route>
        <Route path="claim" element={<Navigate to={RoutesEnum.ACCOUNT} />} />
        <Route path="profile" element={<Navigate to={RoutesEnum.ACCOUNT} />} />

        {/*Swap*/}
        <Route path={RoutesEnum.SWAP} element={<SwapPage />} />
        <Route path={RoutesEnum.SEND} element={<RedirectPathToSwapOnly />} />

        {lazyRoutes.map((item, key) => LazyRoute({ ...item, key }))}

        <Route path={RoutesEnum.ANYSWAP_AFFECTED} element={<AnySwapAffectedUsers />} />
        <Route path={RoutesEnum.CHAT} loader={createRedirectExternal(DISCORD_LINK)} />
        <Route path={RoutesEnum.DOCS} loader={createRedirectExternal(DOCS_LINK)} />
        <Route path={RoutesEnum.STATS} loader={createRedirectExternal(DUNE_DASHBOARD_LINK)} />
        <Route path={RoutesEnum.TWITTER} loader={createRedirectExternal(TWITTER_LINK)} />
        <Route path={RoutesEnum.HOME} element={<RedirectPathToSwapOnly />} />
        <Route
          path="*"
          element={
            <Suspense fallback={Loading}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </Suspense>
  )
}
