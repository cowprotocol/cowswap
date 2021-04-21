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
import Faq from 'pages/Faq'

export const Wrapper = styled(AppMod)``

export default function App() {
  return (
    <Wrapper>
      <Switch>
        <Route exact strict path="/swap" component={Swap} />
        <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
        <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
        <Route exact strict path="/about" component={About} />
        <Route exact strict path="/faq" component={Faq} />
        <Route exact strict path="/privacy-policy" component={PrivacyPolicy} />
        <Route exact strict path="/cookie-policy" component={CookiePolicy} />
        <Route exact strict path="/terms-and-conditions" component={TermsAndConditions} />
        <Route component={RedirectPathToSwapOnly} />
      </Switch>
    </Wrapper>
  )
}
