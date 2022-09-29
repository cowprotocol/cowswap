import '@reach/dialog/styles.css'
import 'inter-ui'
import 'polyfills'

import 'components/analytics'
import 'cow-react/utils/sentry'

import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import Blocklist from 'components/Blocklist'
import Web3Provider from 'components/Web3Provider'
import { LanguageProvider } from 'i18n'
import { App } from 'cow-react/modules/application/containers/App'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import store from 'state'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'theme'

// import { EventUpdater } from 'state/orders/mocks'
import AppziButton from 'components/AppziButton'
import { nodeRemoveChildFix } from 'utils/node'
import { Provider as AtomProvider } from 'jotai'

import Popups from 'components/Popups'
import { Updaters } from 'cow-react/modules/application/containers/App/Updaters'

// Node removeChild hackaround
// based on: https://github.com/facebook/react/issues/11538#issuecomment-417504600
nodeRemoveChildFix()

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Provider store={store}>
      <AtomProvider>
        <HashRouter>
          <LanguageProvider>
            <Web3Provider>
              <Blocklist>
                <BlockNumberProvider>
                  <Updaters />
                  <ThemeProvider>
                    <ThemedGlobalStyle />
                    <Popups />
                    <AppziButton />
                    <App />
                  </ThemeProvider>
                </BlockNumberProvider>
              </Blocklist>
            </Web3Provider>
          </LanguageProvider>
        </HashRouter>
      </AtomProvider>
    </Provider>
  </StrictMode>,
  document.getElementById('root')
)

if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register()
}
