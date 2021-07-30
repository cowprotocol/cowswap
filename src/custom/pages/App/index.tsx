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
import CowGame from 'pages/CowGame'

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

  ${({ theme }) => theme.mediaWidth.upToSmall`
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
        <Route component={RedirectPathToSwapOnly} />
      </Switch>
    </Wrapper>
  )
}
