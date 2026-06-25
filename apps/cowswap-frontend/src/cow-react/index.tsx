import '@reach/dialog/styles.css'
import { Provider as AtomProvider } from 'jotai'
import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode, StrictMode } from 'react'
import './sentry'

import { CowAnalyticsProvider, createNoopCowAnalytics, initGtm } from '@cowprotocol/analytics'
import { isInjectedWidget, nodeRemoveChildFix } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SnackbarsWidget } from '@cowprotocol/snackbars'
import { WalletProvider, Web3Provider } from '@cowprotocol/wallet'

import { Messages } from '@lingui/core'
import * as Sentry from '@sentry/react'
import { useInjectedWidgetParams } from 'entities/injectedWidget'
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

interface RootCrashBoundaryState {
  error: Error | null
  eventId: string | null
}

interface RootCrashFallbackProps {
  error: Error
  eventId: string | null
}

class RootCrashBoundary extends Component<PropsWithChildren, RootCrashBoundaryState> {
  override state: RootCrashBoundaryState = { error: null, eventId: null }

  static getDerivedStateFromError(error: Error): RootCrashBoundaryState {
    return { error, eventId: null }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const eventId = Sentry.captureException(error, {
      tags: { errorBoundary: 'root' },
      contexts: { react: { componentStack: errorInfo.componentStack ?? undefined } },
    })

    this.setState({ error, eventId })
  }

  override componentDidMount(): void {
    window.addEventListener('error', this.handleWindowError)
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  override componentWillUnmount(): void {
    window.removeEventListener('error', this.handleWindowError)
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  override render(): ReactNode {
    const { error, eventId } = this.state

    if (error) {
      return <RootCrashFallback error={error} eventId={eventId} />
    }

    return this.props.children
  }

  private handleWindowError = (event: ErrorEvent): void => {
    this.captureGlobalError(event.error, event.message || 'Unhandled window error')
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    this.captureGlobalError(event.reason, 'Unhandled promise rejection')
  }

  private captureGlobalError(errorLike: unknown, fallbackMessage: string): void {
    const error = toError(errorLike, fallbackMessage)
    const eventId = Sentry.captureException(error, { tags: { errorBoundary: 'root-global' } })

    this.setState({ error, eventId })
  }
}

function RootCrashFallback({ error, eventId }: RootCrashFallbackProps): ReactNode {
  return (
    <main
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: 24,
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'sans-serif',
        color: '#1f2933',
        background: '#f7f8fa',
      }}
    >
      <section style={{ width: '100%', maxWidth: 480 }}>
        <h1 style={{ margin: '0 0 12px', fontSize: 28, lineHeight: 1.2 }}>Something went wrong</h1>
        <p style={{ margin: '0 0 20px', lineHeight: 1.5 }}>Reload the page. If it keeps failing, contact support.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 14px',
            border: 0,
            borderRadius: 6,
            color: '#fff',
            background: '#052b65',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Reload
        </button>
        <p style={{ margin: '20px 0 0', lineHeight: 1.5, color: '#52616f', wordBreak: 'break-word' }}>
          {eventId ? `Event ID: ${eventId}` : error.message}
        </p>
      </section>
    </main>
  )
}

function toError(errorLike: unknown, fallbackMessage: string): Error {
  if (errorLike instanceof Error) {
    return errorLike
  }

  if (typeof errorLike === 'string') {
    return new Error(errorLike)
  }

  return new Error(fallbackMessage)
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
    root.render(
      <RootCrashBoundary>
        <Main localeMessages={localeMessages} />
      </RootCrashBoundary>,
    )
  } catch (err) {
    console.error('Failed to init app', err)
    const error = toError(err, 'Failed to init app')
    const eventId = Sentry.captureException(error, { tags: { errorBoundary: 'root-init' } })
    root.render(<RootCrashFallback error={error} eventId={eventId} />)
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
