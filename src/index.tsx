import 'inter-ui'
import '@reach/dialog/styles.css'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import React, { StrictMode } from 'react'
import { isMobile } from 'react-device-detect'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import Blocklist from './components/Blocklist'
import { NetworkContextName } from 'constants/misc'
import { LanguageProvider } from 'i18n'
import App from 'pages/App'
import store from 'state'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from 'state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import EnhancedTransactionUpdater from '@src/custom/state/enhancedTransactions/updater/GnosisSafeTxUpdater'
import UserUpdater from './state/user/updater'
import FeesUpdater from 'state/price/updater'
import GasUpdater from 'state/gas/updater'
import { CancelledOrdersUpdater, PendingOrdersUpdater, UnfillableOrdersUpdater } from 'state/orders/updaters'
// import { EventUpdater } from 'state/orders/mocks'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'theme'
import getLibrary from './utils/getLibrary'
import { analyticsId } from './custom/utils/analytics'
import AppziButton from 'components/AppziButton'
import { nodeRemoveChildFix } from 'utils/node'

// Node removeChild hackaround
// based on: https://github.com/facebook/react/issues/11538#issuecomment-417504600
nodeRemoveChildFix()

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

if (typeof analyticsId === 'string') {
  ReactGA.initialize(analyticsId, {
    gaOptions: {
      storage: 'none',
      storeGac: false,
    },
  })
  ReactGA.set({
    anonymizeIp: true,
    customBrowserType: !isMobile
      ? 'desktop'
      : 'web3' in window || 'ethereum' in window
      ? 'mobileWeb3'
      : 'mobileRegular',
  })
} else {
  ReactGA.initialize('test', { testMode: true, debug: true })
}

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <EnhancedTransactionUpdater />
      <MulticallUpdater />
      <PendingOrdersUpdater />
      <CancelledOrdersUpdater />
      <FeesUpdater />
      <UnfillableOrdersUpdater />
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
                <LanguageProvider>
                  <App />
                </LanguageProvider>
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
