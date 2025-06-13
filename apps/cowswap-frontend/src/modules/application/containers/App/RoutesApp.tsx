import { lazy, ReactNode, Suspense, useEffect } from 'react'

import {
  COWDAO_COWSWAP_ABOUT_LINK,
  COWDAO_KNOWLEDGE_BASE_LINK,
  COWDAO_LEGAL_LINK,
  DISCORD_LINK,
  DOCS_LINK,
  DUNE_DASHBOARD_LINK,
  TWITTER_LINK,
} from '@cowprotocol/common-const'
import { Loader } from '@cowprotocol/ui'

import { Navigate, Route, Routes } from 'react-router'

import { Loading } from 'legacy/components/FlashingLoading'
import { RedirectPathToSwapOnly, RedirectToPath } from 'legacy/pages/Swap/redirects'

import { Routes as RoutesEnum, RoutesValues } from 'common/constants/routes'
import Account, { AccountOverview } from 'pages/Account'
import AdvancedOrdersPage from 'pages/AdvancedOrders'
import AnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers'
import { HooksPage } from 'pages/Hooks'
import { CowShed } from 'pages/Hooks/cowShed'
import LimitOrderPage from 'pages/LimitOrders'
import { SwapPage } from 'pages/Swap'
import YieldPage from 'pages/Yield'

// Async routes
const NotFound = lazy(() => import(/* webpackChunkName: "not_found" */ 'pages/error/NotFound'))
const CowRunner = lazy(() => import(/* webpackChunkName: "cow_runner" */ 'pages/games/CowRunner'))
const MevSlicer = lazy(() => import(/* webpackChunkName: "mev_slicer" */ 'pages/games/MevSlicer'))

// External routes
const LegalExternal = <ExternalRedirect url={COWDAO_LEGAL_LINK} />

// Account
const AccountTokensOverview = lazy(() => import(/* webpackChunkName: "tokens_overview" */ 'pages/Account/Tokens'))
const AccountNotFound = lazy(() => import(/* webpackChunkName: "affiliate" */ 'pages/error/NotFound'))

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function ExternalRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.replace(url)
  }, [url])

  return null
}

type LazyRouteProps = { route: RoutesValues; element: ReactNode; key?: number }

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function LazyRoute({ route, element, key }: LazyRouteProps) {
  return <Route key={key} path={route} element={<Suspense fallback={<Loading />}>{element}</Suspense>} />
}

const lazyRoutes: LazyRouteProps[] = [
  { route: RoutesEnum.LIMIT_ORDER, element: <LimitOrderPage /> },
  { route: RoutesEnum.YIELD, element: <YieldPage /> },
  { route: RoutesEnum.LONG_LIMIT_ORDER, element: <RedirectToPath path={'/limit'} /> },
  { route: RoutesEnum.ADVANCED_ORDERS, element: <AdvancedOrdersPage /> },
  { route: RoutesEnum.LONG_ADVANCED_ORDERS, element: <RedirectToPath path={'/advanced'} /> },
  { route: RoutesEnum.ABOUT, element: <ExternalRedirect url={COWDAO_COWSWAP_ABOUT_LINK} /> },
  { route: RoutesEnum.FAQ, element: <ExternalRedirect url={COWDAO_KNOWLEDGE_BASE_LINK} /> },
  { route: RoutesEnum.FAQ_PROTOCOL, element: <ExternalRedirect url={COWDAO_KNOWLEDGE_BASE_LINK} /> },
  { route: RoutesEnum.FAQ_TOKEN, element: <ExternalRedirect url={COWDAO_KNOWLEDGE_BASE_LINK} /> },
  { route: RoutesEnum.FAQ_TRADING, element: <ExternalRedirect url={COWDAO_KNOWLEDGE_BASE_LINK} /> },
  { route: RoutesEnum.FAQ_LIMIT_ORDERS, element: <ExternalRedirect url={COWDAO_KNOWLEDGE_BASE_LINK} /> },
  { route: RoutesEnum.FAQ_ETH_FLOW, element: <ExternalRedirect url={COWDAO_KNOWLEDGE_BASE_LINK} /> },
  { route: RoutesEnum.PLAY_COWRUNNER, element: <CowRunner /> },
  { route: RoutesEnum.PLAY_MEVSLICER, element: <MevSlicer /> },
  { route: RoutesEnum.PRIVACY_POLICY, element: LegalExternal },
  { route: RoutesEnum.COOKIE_POLICY, element: LegalExternal },
  { route: RoutesEnum.TERMS_CONDITIONS, element: LegalExternal },
]

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
        <Route path={RoutesEnum.HOOKS} element={<HooksPage />} />
        <Route path={RoutesEnum.COW_SHED} element={<CowShed />} />
        <Route path={RoutesEnum.SEND} element={<RedirectPathToSwapOnly />} />

        {lazyRoutes.map((item, key) => LazyRoute({ ...item, key }))}

        <Route path={RoutesEnum.ANYSWAP_AFFECTED} element={<AnySwapAffectedUsers />} />
        <Route path={RoutesEnum.CHAT} element={<ExternalRedirect url={DISCORD_LINK} />} />
        <Route path={RoutesEnum.DOCS} element={<ExternalRedirect url={DOCS_LINK} />} />
        <Route path={RoutesEnum.STATS} element={<ExternalRedirect url={DUNE_DASHBOARD_LINK} />} />
        <Route path={RoutesEnum.TWITTER} element={<ExternalRedirect url={TWITTER_LINK} />} />

        <Route path={RoutesEnum.HOME} element={<RedirectPathToSwapOnly />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<Loading />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </Suspense>
  )
}
