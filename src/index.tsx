import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import 'inter-ui'
import React, { StrictMode } from 'react'
import { isMobile } from 'react-device-detect'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import Blocklist from './components/Blocklist'
import { NetworkContextName } from './constants'
import './i18n'
import App from 'pages/App'
import store from 'state'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from 'state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import FeesUpdater from 'state/price/updater'
import XdaiUpdater from 'state/network/updater'
import GasUpdater from 'state/gas/updater'
import { EventUpdater } from 'state/orders/updater'
// import { EventUpdater } from 'state/orders/mocks'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'theme'
import getLibrary from './utils/getLibrary'
import { analyticsId } from './custom/utils/analytics'
import AppziButton from 'components/AppziButton'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

if (typeof analyticsId === 'string') {
  ReactGA.initialize(analyticsId, {
    gaOptions: {
      storage: 'none',
      storeGac: false
    }
  })
  ReactGA.set({
    anonymizeIp: true,
    customBrowserType: !isMobile ? 'desktop' : 'web3' in window || 'ethereum' in window ? 'mobileWeb3' : 'mobileRegular'
  })
} else {
  ReactGA.initialize('test', { testMode: true, debug: true })
}

window.addEventListener('error', error => {
  ReactGA.exception({
    description: `${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`,
    fatal: true
  })
})

function Updaters() {
  return (
    <>
      <XdaiUpdater />
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
      <EventUpdater />
      <FeesUpdater />
      <GasUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Blocklist>
          <Provider store={store}>
            <Updaters />
            <ThemeProvider>
              <ThemedGlobalStyle />
              <AppziButton />
              <HashRouter>
                <App />
              </HashRouter>
            </ThemeProvider>
          </Provider>
        </Blocklist>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </StrictMode>,
  document.getElementById('root')
)

serviceWorkerRegistration.unregister()
