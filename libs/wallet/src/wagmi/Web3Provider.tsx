import { useEffect, type ReactNode } from 'react'

import { isImTokenBrowser, isInjectedWidget } from '@cowprotocol/common-utils'
import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reconnect } from '@wagmi/core'
import { WagmiProvider } from 'wagmi'

import { config, reownAppKit } from './config'
import { SafeConnectionHandler } from './SafeConnectionHandler'

import { getIsInjectedMobileBrowser } from '../api/utils/connection'
import { OPEN_WALLET_MODAL_EVENT } from '../constants'
import { COW_WIDGET_CONNECTOR_ID } from '../reown/consts'

const queryClient = new QueryClient()

function isEmbeddedInIframe(): boolean {
  return typeof window !== 'undefined' && window.self !== window.top
}

function ReconnectOnMount(): null {
  useEffect(() => {
    // When running as a pure Safe App (not a widget), skip reconnect and let SafeConnectionHandler
    // handle the wallet — reconnecting a previously saved non-Safe connector first causes a race condition.
    if (isEmbeddedInIframe() && !isInjectedWidget()) return

    if (isInjectedWidget()) {
      // In widget context, use reconnect() (not connect()) to avoid triggering wallet popups.
      // connect() with shimDisconnect=true calls wallet_requestPermissions which shows a MetaMask
      // account selector. reconnect() uses eth_accounts (silent) via isReconnecting=true path.
      // IframeRpcProviderBridge forwards eth_accounts to the parent wallet's provider.
      const widgetConnector = config.connectors.find((c) => c.id === COW_WIDGET_CONNECTOR_ID)
      if (widgetConnector) {
        // Clear the shimDisconnect flag so reconnect() passes isAuthorized() even if the
        // connector was previously "disconnected" (which can happen on widget recreations).
        void config.storage?.removeItem(`${COW_WIDGET_CONNECTOR_ID}.disconnected`)
        reconnect(config, { connectors: [widgetConnector] }).catch((error) => {
          console.debug('[ReconnectOnMount] widget connector reconnect failed', error)
        })
      }
      return
    }

    if (getIsInjectedMobileBrowser()) {
      const injectedConnector = config.connectors.find((c) => c.id === 'injected')

      if (injectedConnector) {
        void (async () => {
          try {
            const provider = await injectedConnector.getProvider()
            if (provider && typeof (provider as { request?: unknown }).request === 'function') {
              const eth = provider as { request: (args: { method: string }) => Promise<unknown> }

              if (isImTokenBrowser) {
                // imToken's eth_requestAccounts hangs when called programmatically.
                // Connection is handled via WalletConnect instead — skip this path.
                return
              }

              // MetaMask iOS: auto-approves eth_requestAccounts inside its own browser.
              // Calling it first seeds eth_accounts so the subsequent reconnect() succeeds
              // without triggering an AppKit state-sync disconnect (which connect() would cause).
              await eth.request({ method: 'eth_requestAccounts' })
            }
            const res = await reconnect(config, { connectors: [injectedConnector] })
            console.debug('[ReconnectOnMount] mobile reconnect result', res)
          } catch (error) {
            console.debug('[ReconnectOnMount] mobile reconnect failed', error)
          }
        })()
        return
      }
    }

    void reconnect(config)
      .then((res: unknown) => {
        console.debug('[ReconnectOnMount] result', res)
      })
      .catch((error: unknown) => {
        console.error('[ReconnectOnMount] error', error)
      })
  }, [])
  return null
}

function OpenWalletModalOnCustomEvent(): null {
  useEffect(() => {
    const handler = (): void => {
      void reownAppKit.open()
    }
    document.addEventListener(OPEN_WALLET_MODAL_EVENT, handler)
    return () => document.removeEventListener(OPEN_WALLET_MODAL_EVENT, handler)
  }, [])
  return null
}

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps): ReactNode {
  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <ReconnectOnMount />
      <OpenWalletModalOnCustomEvent />
      <QueryClientProvider client={queryClient}>
        <SafeProvider>
          <SafeConnectionHandler>{children}</SafeConnectionHandler>
        </SafeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
