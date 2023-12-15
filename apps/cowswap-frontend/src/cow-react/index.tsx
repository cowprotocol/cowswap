import '@reach/dialog/styles.css'
import 'inter-ui'

import '@cowprotocol/analytics'
import './sentry'
import { Provider as AtomProvider } from 'jotai'
import { useEffect, StrictMode } from 'react'

import { BlockNumberProvider } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { nodeRemoveChildFix } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SnackbarsWidget } from '@cowprotocol/snackbars'

import { LanguageProvider } from 'i18n'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'

import AppziButton from 'legacy/components/AppziButton'
import { Popups } from 'legacy/components/Popups'
import Web3Provider from 'legacy/components/Web3Provider'
import { cowSwapStore } from 'legacy/state'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'legacy/theme'

import { App } from 'modules/application/containers/App'
import { Updaters } from 'modules/application/containers/App/Updaters'
import { WithLDProvider } from 'modules/application/containers/WithLDProvider'
import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'

import { FeatureGuard } from 'common/containers/FeatureGuard'

import { WalletUnsupportedNetworkBanner } from '../common/containers/WalletUnsupportedNetworkBanner'

// Node removeChild hackaround
// based on: https://github.com/facebook/react/issues/11538#issuecomment-417504600
nodeRemoveChildFix()

if (window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

function Main() {
  const isInjectedWidgetMode = isInjectedWidget()

  useEffect(() => {
    const skeleton = document.getElementById('skeleton')
    if (skeleton) {
      skeleton.parentNode?.removeChild(skeleton)
    }
  }, [])

  return (
    <StrictMode>
      <FixedGlobalStyle />
      <Provider store={cowSwapStore}>
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

                      {!isInjectedWidgetMode && (
                        <>
                          <FeatureGuard featureFlag="cowFortuneEnabled">
                            <FortuneWidget />
                          </FeatureGuard>
                          <AppziButton />
                        </>
                      )}

                      <Popups />
                      <SnackbarsWidget />
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
}

const container = document.getElementById('root')
if (container !== null) {
  const root = createRoot(container)
  root.render(<Main />)
} else {
  console.error('Failed to find the root element')
}

if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register()
}
