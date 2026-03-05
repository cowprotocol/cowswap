import '@reach/dialog/styles.css'
import { Provider as AtomProvider } from 'jotai'
import { ReactNode, StrictMode } from 'react'
import './sentry'

import { CowAnalyticsProvider, initGtm } from '@cowprotocol/analytics'
import { nodeRemoveChildFix } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SnackbarsWidget } from '@cowprotocol/snackbars'
import { LegacyWeb3Provider, Web3Provider } from '@cowprotocol/wallet'

import { Messages } from '@lingui/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from 'i18n'
import { useHydrateAtoms } from 'jotai/react/utils'
import { queryClientAtom } from 'jotai-tanstack-query'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import SvgCacheProvider from 'react-inlinesvg/provider'
import { Provider } from 'react-redux'
import { unstable_HistoryRouter as HistoryRouter } from 'react-router'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import { ThemeProvider } from 'theme'

import { cowSwapStore } from 'legacy/state'
import { useAppSelector } from 'legacy/state/hooks'

import { App, Updaters, WithLDProvider } from 'modules/application'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { loadActiveLocaleMessages } from 'lib/localeMessages'

import { APP_HEADER_ELEMENT_ID } from '../common/constants/common'
import { hashHistory } from '../common/constants/routes'
import { WalletUnsupportedNetworkBanner } from '../common/containers/WalletUnsupportedNetworkBanner'
import { BlockNumberProvider } from '../common/hooks/useBlockNumber'

const cowAnalytics = initGtm()
const helmetContext = {}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
})

function HydrateQueryClient({ children }: { children: ReactNode }): ReactNode {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return children
}

// Node removeChild hackaround
// based on: https://github.com/facebook/react/issues/11538#issuecomment-417504600
nodeRemoveChildFix()

if (window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
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
            <QueryClientProvider client={queryClient}>
              <AtomProvider store={jotaiStore}>
                <HydrateQueryClient>
                  <ThemeProvider>
                    <HistoryRouter history={hashHistory}>
                      <LanguageProvider messages={localeMessages}>
                        <WithLDProvider>
                          <Web3ProviderInstance>
                            <BlockNumberProvider>
                              <CowAnalyticsProvider cowAnalytics={cowAnalytics}>
                                <WalletUnsupportedNetworkBanner />
                                <Updaters />
                                <Toasts />
                                <App />
                              </CowAnalyticsProvider>
                            </BlockNumberProvider>
                          </Web3ProviderInstance>
                        </WithLDProvider>
                      </LanguageProvider>
                    </HistoryRouter>
                  </ThemeProvider>
                </HydrateQueryClient>
              </AtomProvider>
            </QueryClientProvider>
          </Provider>
        </HelmetProvider>
      </SvgCacheProvider>
    </StrictMode>
  )
}

async function initApp(): Promise<void> {
  const container = document.getElementById('root')
  if (container !== null) {
    const root = createRoot(container)
    // load localeMessages before initial <Main> render to prevent extra renders
    const localeMessages = await loadActiveLocaleMessages()
    root.render(<Main localeMessages={localeMessages} />)
  } else {
    console.error('Failed to find the root element')
  }
}

function Toasts(): ReactNode {
  const { disableToastMessages = false } = useInjectedWidgetParams()

  return <SnackbarsWidget hidden={disableToastMessages} anchorElementId={APP_HEADER_ELEMENT_ID} />
}

function Web3ProviderInstance({ children }: { children: ReactNode }): ReactNode {
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet)
  const { standaloneMode } = useInjectedWidgetParams()

  return (
    <LegacyWeb3Provider standaloneMode={standaloneMode} selectedWallet={selectedWallet}>
      <Web3Provider>{children}</Web3Provider>
    </LegacyWeb3Provider>
  )
}

initApp()

if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register()
}
