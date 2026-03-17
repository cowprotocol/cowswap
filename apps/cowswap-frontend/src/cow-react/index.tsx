import '@reach/dialog/styles.css'
import { Provider as AtomProvider } from 'jotai'
import { Component, type ReactNode, StrictMode } from 'react'
import './sentry'

// Deduplicate eth_sendTransaction at the provider so only one "transaction complete" window opens (MetaMask).
deduplicateEthereumSendTransaction()

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'
import { nodeRemoveChildFix } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SnackbarsWidget } from '@cowprotocol/snackbars'
import { WalletProvider, Web3Provider } from '@cowprotocol/wallet'

import { Messages } from '@lingui/core'
import { LanguageProvider } from 'i18n'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import SvgCacheProvider from 'react-inlinesvg/provider'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import { ThemeProvider } from 'theme'

import { cowSwapStore } from 'legacy/state'

import { App, Updaters, WithLDProvider } from 'modules/application'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { deduplicateEthereumSendTransaction } from 'lib/deduplicateEthereumSendTransaction'
import { loadActiveLocaleMessages } from 'lib/localeMessages'

import { APP_HEADER_ELEMENT_ID } from '../common/constants/common'
import { WalletUnsupportedNetworkBanner } from '../common/containers/WalletUnsupportedNetworkBanner'
import { BlockNumberProvider } from '../common/hooks/useBlockNumber'

const cowAnalytics = initGtm()
const helmetContext = {}

/** Catches render errors so the page shows a message instead of staying blank. */
class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error }
  }

  override componentDidCatch(error: Error): void {
    console.error('Root error boundary:', error)
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 560 }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <pre style={{ overflow: 'auto', fontSize: 12 }}>{this.state.error.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

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
      <RootErrorBoundary>
        <SvgCacheProvider>
          <HelmetProvider context={helmetContext}>
            <Provider store={cowSwapStore}>
              <AtomProvider store={jotaiStore}>
                <ThemeProvider>
                  <WalletProvider>
                    <HashRouter>
                      <LanguageProvider messages={localeMessages}>
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
                      </LanguageProvider>
                    </HashRouter>
                  </WalletProvider>
                </ThemeProvider>
              </AtomProvider>
            </Provider>
          </HelmetProvider>
        </SvgCacheProvider>
      </RootErrorBoundary>
    </StrictMode>
  )
}

function Toasts(): ReactNode {
  const { disableToastMessages = false } = useInjectedWidgetParams()

  return <SnackbarsWidget hidden={disableToastMessages} anchorElementId={APP_HEADER_ELEMENT_ID} />
}

async function initApp(): Promise<void> {
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

initApp()

if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register()
}
