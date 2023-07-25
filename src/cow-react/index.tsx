import '@reach/dialog/styles.css'
import 'inter-ui'

import 'legacy/components/analytics'
import 'utils/sentry'

import { Provider as AtomProvider } from 'jotai'
import { StrictMode } from 'react'

import { LanguageProvider } from 'i18n'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'

import AppziButton from 'legacy/components/AppziButton'
import { Popups } from 'legacy/components/Popups'
import Web3Provider from 'legacy/components/Web3Provider'
import store from 'legacy/state'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'legacy/theme'
import { nodeRemoveChildFix } from 'legacy/utils/node'

import { App } from 'modules/application/containers/App'
import { Updaters } from 'modules/application/containers/App/Updaters'
import { WithLDProvider } from 'modules/application/containers/WithLDProvider'
import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'

import { FeatureGuard } from 'common/containers/FeatureGuard'
import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'

import { WalletUnsupportedNetworkBanner } from '../common/containers/WalletUnsupportedNetworkBanner'
import { jotaiStore } from '../jotaiStore'

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
      <AtomProvider store={jotaiStore}>
        <HashRouter>
          <LanguageProvider>
            <Web3Provider>
              <ThemeProvider>
                <ThemedGlobalStyle />
                <WalletUnsupportedNetworkBanner />
                <BlockNumberProvider>
                  <WithLDProvider>
                    <Updaters />
                    <FeatureGuard featureFlag="cowFortuneEnabled">
                      <FortuneWidget />
                    </FeatureGuard>
                    <Popups />
                    <AppziButton />
                    <App />
                  </WithLDProvider>
                </BlockNumberProvider>
              </ThemeProvider>
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
