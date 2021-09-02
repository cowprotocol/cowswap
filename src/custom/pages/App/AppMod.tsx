import React, { Suspense, /* PropsWithChildren, */ ReactNode, useState, useEffect } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import GoogleAnalyticsReporter from 'components/analytics/GoogleAnalyticsReporter'
// import AddressClaimModal from '../components/claim/AddressClaimModal'
import Header from 'components/Header'
import Polling from 'components/Header/Polling'
import URLWarning from 'components/Header/URLWarning'
import Popups from 'components/Popups'
import Web3ReactManager from 'components/Web3ReactManager'
import ErrorBoundary from 'components/ErrorBoundary'
// import { ApplicationModal } from '../../state/application/actions'
// import { useModalOpen, useToggleModal } from '../state/application/hooks'
import DarkModeQueryParamReader from 'theme'
import ReferralLinkUpdater from 'state/affiliate/updater'
// import {
//   RedirectDuplicateTokenIds,
// } from './AddLiquidity/redirects'
// import Earn from './Earn'
// import Manage from './Earn/Manage'
// import MigrateV2 from './MigrateV2'
// import MigrateV2Pair from './MigrateV2/MigrateV2Pair'
// import Pool from './Pool'
// import PoolV2 from './Pool/v2'
// import PoolFinder from './PoolFinder'
// import RemoveLiquidity from './RemoveLiquidity'
// import RemoveLiquidityV3 from 'pages/RemoveLiquidity/V3'
// import Swap from 'pages/Swap'
// import { OpenClaimAddressModalAndRedirectToSwap, RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
// import Vote from './Vote'
// import VotePage from './Vote/VotePage'
// import { RedirectDuplicateTokenIdsV2 } from './AddLiquidityV2/redirects'
// import { PositionPage } from './Pool/PositionPage'
// import AddLiquidity from './AddLiquidity'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'

import Footer from 'components/Footer'
import { BodyWrapper } from '.'
import * as CSS from 'csstype' // mod

interface AppWrapProps {
  bgBlur?: boolean
}

const AppWrapper = styled.div<Partial<CSS.Properties & AppWrapProps>>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  min-height: 100vh;
  overflow-x: hidden;
  &:after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    filter: blur(5px);
    background-image: ${({ theme }) => theme.body.background};
    opacity: 0;
    transition: 0.5s;
  }
  ${(props) => (props.bgBlur ? '&:after {opacity: 1}' : '&:after {opacity:0}')};
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

/* const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 120px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 6rem 16px 0;
  `};

  z-index: 1;
` */

const FooterWrapper = styled(HeaderWrapper)``

const Marginer = styled.div`
  margin-top: 5rem;
`

// function TopLevelModals() {
//   const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
//   const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
//   return <AddressClaimModal isOpen={open} onDismiss={toggle} />
// }

export default function App(props?: { children?: ReactNode }) {
  const [bgBlur, setBgBlur] = useState(false)
  const location = useLocation()
  useEffect(() => {
    if (location.pathname.length > 1 && location.pathname !== '/swap') {
      setBgBlur(true)
    } else {
      setBgBlur(false)
    }
  }, [location.pathname])
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Route component={GoogleAnalyticsReporter} />
        <Route component={DarkModeQueryParamReader} />
        <Route component={ApeModeQueryParamReader} />
        <AppWrapper bgBlur={bgBlur}>
          <Popups />
          <URLWarning />
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <BodyWrapper>
            <Polling />
            {/* <TopLevelModals /> */}
            <ReferralLinkUpdater />
            <Web3ReactManager>
              <Switch>
                {props && props.children}
                {/* <Route exact strict path="/swap" component={Swap} />
              <Route exact strict path="/claim" component={OpenClaimAddressModalAndRedirectToSwap} />
              <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
              <Route exact strict path="/find" component={PoolFinder} />
              <Route exact strict path="/pool" component={Pool} />
              <Route exact strict path="/uni" component={Earn} />
              <Route exact strict path="/vote" component={Vote} />
              <Route exact strict path="/create" component={RedirectToAddLiquidity} />
              <Route exact path="/add" component={AddLiquidity} />
              <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact path="/create" component={AddLiquidity} />
              <Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact strict path="/remove/v1/:address" component={RemoveV1Exchange} />
              <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
              <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
              <Route exact strict path="/migrate/v1" component={MigrateV1} />
              <Route exact strict path="/migrate/v1/:address" component={MigrateV1Exchange} />
              <Route exact strict path="/uni/:currencyIdA/:currencyIdB" component={Manage} />
              <Route exact strict path="/vote/:id" component={VotePage} />
              <Route component={RedirectPathToSwapOnly} /> */}
              </Switch>
            </Web3ReactManager>
            <Marginer />
          </BodyWrapper>
          <FooterWrapper>
            <Footer />
          </FooterWrapper>
        </AppWrapper>
      </Suspense>
    </ErrorBoundary>
  )
}
