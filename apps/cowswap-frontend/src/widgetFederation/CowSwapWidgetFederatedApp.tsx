import '@reach/dialog/styles.css'
import '../styles/fonts.css'

import { Provider as AtomProvider } from 'jotai'
import { ReactElement, ReactNode, StrictMode, useEffect, useMemo } from 'react'

import { CowAnalyticsProvider, type CowAnalytics, type OutboundLinkParams } from '@cowprotocol/analytics'
import { jotaiStore } from '@cowprotocol/core'
import { CowWidgetEventListeners } from '@cowprotocol/events'
import { SnackbarsWidget } from '@cowprotocol/snackbars'
import { WalletProvider, Web3Provider } from '@cowprotocol/wallet'
import {
  buildWidgetPath,
  buildWidgetUrlQuery,
  CowSwapWidgetAppParams,
  CowSwapWidgetParams,
  CowSwapWidgetProps,
} from '@cowprotocol/widget-lib'

import { Messages } from '@lingui/core'
import { LanguageProvider } from 'i18n'
import { HelmetProvider } from 'react-helmet-async'
import SvgCacheProvider from 'react-inlinesvg/provider'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from 'theme'
import { WIDGET_EVENT_EMITTER } from 'widgetEventEmitter'

import ErrorBoundary from 'legacy/components/ErrorBoundary'
import { cowSwapStore } from 'legacy/state'

import { App } from 'modules/application/containers/App'
import { Updaters } from 'modules/application/containers/App/Updaters'
import { React310RecoveryErrorBoundary } from 'modules/application/containers/React310RecoveryErrorBoundary/React310RecoveryErrorBoundary.container'
import { WithLDProvider } from 'modules/application/containers/WithLDProvider'
import { resetReact310RecoveryOnDocumentLoad } from 'modules/application/lib/react310Recovery'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { injectedWidgetHooksEnabledAtom } from 'modules/injectedWidget/state/injectedWidgetHooksEnabledAtom'
import { injectedWidgetMetaDataAtom } from 'modules/injectedWidget/state/injectedWidgetMetaDataAtom'
import { injectedWidgetParamsAtom } from 'modules/injectedWidget/state/injectedWidgetParamsAtom'
import { validateWidgetParams } from 'modules/injectedWidget/utils/validateWidgetParams'

import { APP_HEADER_ELEMENT_ID } from 'common/constants/common'
import { WalletUnsupportedNetworkBanner } from 'common/containers/WalletUnsupportedNetworkBanner'
import { BlockNumberProvider } from 'common/hooks/useBlockNumber'
import { loadActiveLocaleMessages } from 'lib/localeMessages'

const helmetContext = {}
const localeMessagesPromise = loadActiveLocaleMessages()
const federatedNoopCowAnalytics: CowAnalytics = {
  setUserAccount() {},
  sendPageView() {},
  sendEvent() {},
  sendTiming() {},
  sendError() {},
  outboundLink({ hitCallback }: OutboundLinkParams) {
    window.setTimeout(hitCallback, 0)
  },
  setContext() {},
}

resetReact310RecoveryOnDocumentLoad()

export interface CowSwapWidgetFederatedAppProps extends CowSwapWidgetProps {
  localeMessages: Messages | undefined
}

export function loadFederatedWidgetLocaleMessages(): Promise<Messages | undefined> {
  return localeMessagesPromise
}

export function CowSwapWidgetFederatedApp(props: CowSwapWidgetFederatedAppProps): ReactElement {
  const route = useMemo(() => buildRoute(props.params), [props.params])

  return (
    <StrictMode>
      <SvgCacheProvider>
        <HelmetProvider context={helmetContext}>
          <Provider store={cowSwapStore}>
            <AtomProvider store={jotaiStore}>
              <ThemeProvider>
                <WalletProvider>
                  <MemoryRouter key={route} initialEntries={[route]}>
                    <LanguageProvider messages={props.localeMessages}>
                      <ErrorBoundary>
                        <React310RecoveryErrorBoundary>
                          <WithLDProvider>
                            <Web3Provider>
                              <BlockNumberProvider>
                                <CowAnalyticsProvider cowAnalytics={federatedNoopCowAnalytics}>
                                  <WalletUnsupportedNetworkBanner />
                                  <FederatedWidgetListeners listeners={props.listeners} />
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
                  </MemoryRouter>
                </WalletProvider>
              </ThemeProvider>
            </AtomProvider>
          </Provider>
        </HelmetProvider>
      </SvgCacheProvider>
    </StrictMode>
  )
}

function buildRoute(params: CowSwapWidgetParams): string {
  const query = buildWidgetUrlQuery({ ...params, hooks: undefined }).toString()
  const path = buildWidgetPath(params)

  return `${path}?${query}`
}

function getAppParams(params: CowSwapWidgetParams): CowSwapWidgetAppParams {
  const { theme: _theme, hooks: _hooks, ...appParams } = params

  return appParams
}

export function setFederatedWidgetParams(params: CowSwapWidgetParams): void {
  const appParams = getAppParams(params)

  jotaiStore.set(injectedWidgetHooksEnabledAtom, false)
  jotaiStore.set(injectedWidgetMetaDataAtom, { appCode: params.appCode })
  jotaiStore.set(injectedWidgetParamsAtom, {
    params: appParams,
    errors: validateWidgetParams(appParams),
  })
}

function FederatedWidgetListeners({ listeners }: { listeners?: CowWidgetEventListeners }): null {
  useEffect(() => {
    if (!listeners) return

    listeners.forEach((listener) => WIDGET_EVENT_EMITTER.on(listener))

    return () => {
      listeners.forEach((listener) => WIDGET_EVENT_EMITTER.off(listener))
    }
  }, [listeners])

  return null
}

function Toasts(): ReactNode {
  const { disableToastMessages = false } = useInjectedWidgetParams()

  return <SnackbarsWidget hidden={disableToastMessages} anchorElementId={APP_HEADER_ELEMENT_ID} />
}
