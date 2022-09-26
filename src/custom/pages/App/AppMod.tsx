import { initializeAnalytics } from 'components/AmplitudeAnalytics'
import Loader from 'components/Loader'
import TopLevelModals from 'components/TopLevelModals'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { /*Lazy,*/ Suspense, /* PropsWithChildren, */ ReactNode } from 'react'
import { /*Redirect,*/ Route, Switch, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import GoogleAnalyticsReporter from 'components/analytics/GoogleAnalyticsReporter'
import ErrorBoundary from 'components/ErrorBoundary'
import Header from 'components/Header'
import Polling from 'components/Header/Polling'

import DarkModeQueryParamReader from 'theme'
/* import AddLiquidity from './AddLiquidity'
import { RedirectDuplicateTokenIds } from './AddLiquidity/redirects'
import { RedirectDuplicateTokenIdsV2 } from './AddLiquidityV2/redirects'
import Earn from './Earn'
import Manage from './Earn/Manage'
import MigrateV2 from './MigrateV2'
import MigrateV2Pair from './MigrateV2/MigrateV2Pair'
import Pool from './Pool'
import { PositionPage } from './Pool/PositionPage'
import PoolV2 from './Pool/v2'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import RemoveLiquidityV3 from './RemoveLiquidity/V3'
import Swap from './Swap'
import { OpenClaimAddressModalAndRedirectToSwap, RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
*/

// const Vote = lazy(() => import('./Vote'))

// MOD imports
import ReferralLinkUpdater from 'state/affiliate/updater'
import URLWarning from 'components/Header/URLWarning'
import Footer from 'components/Footer'
import { BodyWrapper } from '.'
import * as CSS from 'csstype' // mod

// const Vote = lazy(() => import('./Vote'))

const AppWrapper = styled.div<Partial<CSS.Properties>>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  // MOD
  min-height: 100vh;
  /* overflow-x: hidden; */ // mod
`

/* const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 120px 16px 0px 16px;
  align-items: center;
  flex: 1;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 4rem 8px 16px 8px;
  `};
` */

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  /* position: fixed;
  top: 0;
  z-index: 2; */
`

const FooterWrapper = styled(HeaderWrapper)`
  z-index: 1;
  width: auto;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

export default function App(props?: { children?: ReactNode }) {
  const location = useLocation()

  initializeAnalytics()

  return (
    <ErrorBoundary>
      <Route component={GoogleAnalyticsReporter} />
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
              {props && props.children}
              {/* <Route exact strict path="/vote" component={Vote} />
              <Route exact strict path="/vote/:governorIndex/:id" component={VotePage} />
              <Route exact strict path="/claim" component={OpenClaimAddressModalAndRedirectToSwap} />
              <Route exact strict path="/uni" component={Earn} />
              <Route exact strict path="/uni/:currencyIdA/:currencyIdB" component={Manage} />

              <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
              <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/swap" component={Swap} />

              <Route exact strict path="/pool/v2/find" component={PoolFinder} />
              <Route exact strict path="/pool/v2" component={PoolV2} />
              <Route exact strict path="/pool" component={Pool} />
              <Route exact strict path="/pool/:tokenId" component={PositionPage} />

              <Route exact strict path="/add/v2/:currencyIdA?/:currencyIdB?" component={RedirectDuplicateTokenIdsV2} />
              <Route
                exact
                strict
                path="/add/:currencyIdA?/:currencyIdB?/:feeAmount?"
                component={RedirectDuplicateTokenIds}
              />

              <Route
                exact
                strict
                path="/increase/:currencyIdA?/:currencyIdB?/:feeAmount?/:tokenId?"
                component={AddLiquidity}
              />

              <Route exact strict path="/remove/v2/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
              <Route exact strict path="/remove/:tokenId" component={RemoveLiquidityV3} />

              <Route exact strict path="/migrate/v2" component={MigrateV2} />
              <Route exact strict path="/migrate/v2/:address" component={MigrateV2Pair} />

              <Route component={RedirectPathToSwapOnly} /> */}
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
