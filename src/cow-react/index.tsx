import '@reach/dialog/styles.css'
import 'inter-ui'

import 'legacy/components/analytics'
import 'utils/sentry'

import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import Blocklist from 'legacy/components/Blocklist'
import Web3Provider from 'legacy/components/Web3Provider'
import { LanguageProvider } from 'i18n'
import { App } from 'modules/application/containers/App'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import store from 'legacy/state'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'legacy/theme'

// import { EventUpdater } from 'legacy/state/orders/mocks'
import AppziButton from 'legacy/components/AppziButton'
import { nodeRemoveChildFix } from 'legacy/utils/node'
import { Provider as AtomProvider } from 'jotai'

import Popups from 'legacy/components/Popups'
import { Updaters } from 'modules/application/containers/App/Updaters'
import { createRoot } from 'react-dom/client'
import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'
import { FeatureGuard } from 'common/containers/FeatureGuard'
import { WithLDProvider } from 'modules/application/containers/WithLDProvider'

// Node removeChild hackaround
// based on: https://github.com/facebook/react/issues/11538#issuecomment-417504600
nodeRemoveChildFix()

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Provider store={store}>
      <AtomProvider>
        <HashRouter>
          <LanguageProvider>
            <Web3Provider>
              <Blocklist>
                <BlockNumberProvider>
                  <WithLDProvider>
                    <Updaters />
                    <ThemeProvider>
                      <ThemedGlobalStyle />
                      <FeatureGuard featureFlag="cowFortuneEnabled">
                        <FortuneWidget />
                      </FeatureGuard>
                      <Popups />
                      <AppziButton />
                      <App />
                    </ThemeProvider>
                  </WithLDProvider>
                </BlockNumberProvider>
              </Blocklist>
            </Web3Provider>
          </LanguageProvider>
        </HashRouter>
      </AtomProvider>
    </Provider>
  </StrictMode>
)

if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register()
}
