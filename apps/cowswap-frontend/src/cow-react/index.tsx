import '@reach/dialog/styles.css'
import { Provider as AtomProvider } from 'jotai'
import { type ReactNode, StrictMode } from 'react'

import { Messages } from '@lingui/core'
import './sentry'

import { CowAnalyticsProvider, createNoopCowAnalytics, initGtm } from '@cowprotocol/analytics'
import { isInjectedWidget, nodeRemoveChildFix } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SnackbarsWidget } from '@cowprotocol/snackbars'
import { WalletProvider, Web3Provider } from '@cowprotocol/wallet'

import { LanguageProvider } from 'i18n'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import SvgCacheProvider from 'react-inlinesvg/provider'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import { ThemeProvider } from 'theme'

import ErrorBoundary from 'legacy/components/ErrorBoundary'
import { cowSwapStore } from 'legacy/state'

import {
  App,
  React310RecoveryErrorBoundary,
  resetReact310RecoveryOnDocumentLoad,
  Updaters,
  WithLDProvider,
} from 'modules/application'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { loadActiveLocaleMessages } from 'lib/localeMessages'

import { APP_HEADER_ELEMENT_ID } from '../common/constants/common'
import { WalletUnsupportedNetworkBanner } from '../common/containers/WalletUnsupportedNetworkBanner'
import { BlockNumberProvider } from '../common/hooks/useBlockNumber'

const cowAnalytics = isInjectedWidget() ? createNoopCowAnalytics() : initGtm()
const helmetContext = {}

// Node removeChild hackaround
// based on: https://github.com/facebook/react/issues/11538#issuecomment-417504600
nodeRemoveChildFix()

// Disable MetaMask network auto-refresh; ignore when window.ethereum is read-only (e.g. another extension set it with a getter).
try {
  if (window.ethereum) {
    window.ethereum.autoRefreshOnNetworkChange = false
  }
} catch {
  // ignore when property cannot be set (multiple wallet extensions conflict)
}

interface MainProps {
  localeMessages: Messages | undefined
}

export function Main({ localeMessages }: MainProps): ReactNode {
  return (
    <StrictMode>
      <SvgCacheProvider>
        <HelmetProvider context={helmetContext}>
          <Provider store={cowSwapStore}>
            <AtomProvider store={jotaiStore}>
              <ThemeProvider>
                <WalletProvider>
                  <HashRouter>
                    <LanguageProvider messages={localeMessages}>
                      <ErrorBoundary>
                        <React310RecoveryErrorBoundary>
                          <WithLDProvider>
                            <Web3Provider>
                              <BlockNumberProvider>
                                <CowAnalyticsProvider cowAnalytics={cowAnalytics}>
                                  <WalletUnsupportedNetworkBanner />
                                  <Updaters />
                                  <Toasts />
                                  <App />
                                </CowAnalyticsProvider>
                              </BlockNumberProvider>
                            </Web3Provider>
                          </WithLDProvider>
                        </React310RecoveryErrorBoundary>
                      </ErrorBoundary>
                    </LanguageProvider>
                  </HashRouter>
                </WalletProvider>
              </ThemeProvider>
            </AtomProvider>
          </Provider>
        </HelmetProvider>
      </SvgCacheProvider>
    </StrictMode>
  )
}

async function initApp(): Promise<void> {
  resetReact310RecoveryOnDocumentLoad()

  const container = document.getElementById('root')
  if (container === null) {
    console.error('Failed to find the root element')
    return
  }
  const root = createRoot(container)
  try {
    const localeMessages = await loadActiveLocaleMessages()
    root.render(<Main localeMessages={localeMessages} />)
  } catch (err) {
    console.error('Failed to init app', err)
    const message = err instanceof Error ? err.message : String(err)
    root.render(
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <h1>Failed to load</h1>
        <p>{message}</p>
      </div>,
    )
  }
}

function Toasts(): ReactNode {
  const { disableToastMessages = false } = useInjectedWidgetParams()

  return <SnackbarsWidget hidden={disableToastMessages} anchorElementId={APP_HEADER_ELEMENT_ID} />
}

initApp()

if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register()
}
