import '@reach/dialog/styles.css'
import 'inter-ui'
import './sentry'
import { Provider as AtomProvider } from 'jotai'
import { ReactNode, StrictMode } from 'react'

import { CowAnalyticsProvider } from '@cowprotocol/analytics'
import { nodeRemoveChildFix } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SnackbarsWidget } from '@cowprotocol/snackbars'
import { Web3Provider } from '@cowprotocol/wallet'

import { LanguageProvider } from 'i18n'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import { ThemedGlobalStyle, ThemeProvider } from 'theme'

import { cowSwapStore } from 'legacy/state'
import { useAppSelector } from 'legacy/state/hooks'

import { cowAnalytics } from 'modules/analytics'
import { App } from 'modules/application/containers/App'
import { Updaters } from 'modules/application/containers/App/Updaters'
import { WithLDProvider } from 'modules/application/containers/WithLDProvider'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { WalletUnsupportedNetworkBanner } from '../common/containers/WalletUnsupportedNetworkBanner'
import { BlockNumberProvider } from '../common/hooks/useBlockNumber'

// Node removeChild hackaround
// based on: https://github.com/facebook/react/issues/11538#issuecomment-417504600
nodeRemoveChildFix()

if (window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

function Main() {
  return (
    <StrictMode>
      <Provider store={cowSwapStore}>
        <AtomProvider store={jotaiStore}>
          <HashRouter>
            <LanguageProvider>
              <Web3ProviderInstance>
                <ThemeProvider>
                  <ThemedGlobalStyle />
                  <BlockNumberProvider>
                    <WithLDProvider>
                      <CowAnalyticsProvider cowAnalytics={cowAnalytics}>
                        <WalletUnsupportedNetworkBanner />
                        <Updaters />

                        <Toasts />
                        <App />
                      </CowAnalyticsProvider>
                    </WithLDProvider>
                  </BlockNumberProvider>
                </ThemeProvider>
              </Web3ProviderInstance>
            </LanguageProvider>
          </HashRouter>
        </AtomProvider>
      </Provider>
    </StrictMode>
  )
}

function Web3ProviderInstance({ children }: { children: ReactNode }) {
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet)

  return <Web3Provider selectedWallet={selectedWallet}>{children}</Web3Provider>
}

function Toasts() {
  const { disableToastMessages = false } = useInjectedWidgetParams()

  return <SnackbarsWidget hidden={disableToastMessages} />
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
