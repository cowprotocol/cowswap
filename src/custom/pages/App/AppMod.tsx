import Loader from 'components/Loader'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { /*Lazy,*/ Suspense, /* PropsWithChildren, */ ReactNode, useState, useEffect } from 'react'
import { /*Redirect,*/ Route, Switch, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import GoogleAnalyticsReporter from 'components/analytics/GoogleAnalyticsReporter'
import AddressClaimModal from 'components/claim/AddressClaimModal'
import ErrorBoundary from 'components/ErrorBoundary'
import Header from 'components/Header'
import Polling from 'components/Header/Polling'
import Popups from 'components/Popups'
import Web3ReactManager from 'components/Web3ReactManager'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
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

// MOD imports
import ReferralLinkUpdater from 'state/affiliate/updater'
import URLWarning from 'components/Header/URLWarning'
import Footer from 'components/Footer'
import { BodyWrapper } from '.'
import * as CSS from 'csstype' // mod

// const Vote = lazy(() => import('./Vote'))

interface AppWrapProps {
  bgBlur?: boolean
}

const AppWrapper = styled.div<Partial<CSS.Properties & AppWrapProps>>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  // MOD
  min-height: 100vh;
  overflow-x: hidden;
  &:after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    filter: blur(20px);
    backdrop-filter: blur(20px);
    background-image: ${({ theme }) => theme.body.background};
    opacity: 0;
    transition: 0.5s;
  }
  ${(props) => (props.bgBlur ? '&:after {opacity: 1}' : '&:after {opacity:0}')};
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

function TopLevelModals() {
  const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
  const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  return <AddressClaimModal isOpen={open} onDismiss={toggle} />
}

export default function App(props?: { children?: ReactNode }) {
  const [bgBlur, setBgBlur] = useState(false)
  const location = useLocation()
  useEffect(() => {
    setBgBlur(location.pathname.length > 1 && location.pathname !== '/swap')
  }, [location.pathname])
  return (
    <ErrorBoundary>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <Route component={ApeModeQueryParamReader} />
      <Web3ReactManager>
        <AppWrapper bgBlur={bgBlur}>
          <URLWarning />
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <BodyWrapper>
            <Popups />
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

              <Route exact strict path="/create-proposal" component={CreateProposal} />
              <Route component={RedirectPathToSwapOnly} /> */}
              </Switch>
            </Suspense>
            <Marginer />
          </BodyWrapper>
          <FooterWrapper>
            <Footer />
          </FooterWrapper>
        </AppWrapper>
      </Web3ReactManager>
    </ErrorBoundary>
  )
}
