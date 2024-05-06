import '@reach/dialog/styles.css'
import 'inter-ui'

import '@cowprotocol/analytics'
import './sentry'
import { Provider as AtomProvider } from 'jotai'
import { useEffect, StrictMode, ReactNode } from 'react'

import { BlockNumberProvider } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { nodeRemoveChildFix } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SnackbarsWidget } from '@cowprotocol/snackbars'
import { Web3Provider } from '@cowprotocol/wallet'

import { LanguageProvider } from 'i18n'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import styled from 'styled-components/macro'

import AppziButton from 'legacy/components/AppziButton'
import { upToMedium, useMediaQuery } from 'legacy/hooks/useMediaQuery'
import { cowSwapStore } from 'legacy/state'
import { useAppSelector } from 'legacy/state/hooks'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'legacy/theme'

import { App } from 'modules/application/containers/App'
import { Updaters } from 'modules/application/containers/App/Updaters'
import { WithLDProvider } from 'modules/application/containers/WithLDProvider'
import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

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

  const isUpToMedium = useMediaQuery(upToMedium)

  const FooterButtonsWrapper = styled.div<{ isUpToMedium: boolean }>`
    display: ${({ isUpToMedium }) => (isUpToMedium ? 'none' : 'block')};
  `

  return (
    <StrictMode>
      <FixedGlobalStyle />
      <Provider store={cowSwapStore}>
        <AtomProvider store={jotaiStore}>
          <HashRouter>
            <LanguageProvider>
              <Web3ProviderInstance>
                <ThemeProvider>
                  <ThemedGlobalStyle />
                  <BlockNumberProvider>
                    <WithLDProvider>
                      <WalletUnsupportedNetworkBanner />
                      <Updaters />

                      {!isInjectedWidgetMode && !isUpToMedium && (
                        <FooterButtonsWrapper isUpToMedium={isUpToMedium}>
                          <FeatureGuard featureFlag="cowFortuneEnabled">
                            <FortuneWidget />
                          </FeatureGuard>
                          <AppziButton />
                        </FooterButtonsWrapper>
                      )}

                      <Toasts />
                      <App />
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
  const selectedWalletBackfilled = useAppSelector((state) => state.user.selectedWalletBackfilled)
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet)

  return (
    <Web3Provider selectedWalletBackfilled={selectedWalletBackfilled} selectedWallet={selectedWallet}>
      {children}
    </Web3Provider>
  )
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
