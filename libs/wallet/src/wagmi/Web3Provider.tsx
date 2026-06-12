import { useEffect, type ReactNode } from 'react'

import { isImTokenBrowser, isInjectedWidget } from '@cowprotocol/common-utils'
import { getParentOrigin } from '@cowprotocol/iframe-transport'
import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { reconnect } from '@wagmi/core'
import { WagmiProvider } from 'wagmi'

import { config, reownAppKit } from './config'
import { markInitialReconnectSettled } from './initialReconnectLifecycle'
import { flushDeferredProviders } from './providerIsolation'
import { SafeConnectionHandler } from './SafeConnectionHandler'

import { getIsInjectedMobileBrowser } from '../api/utils/connection'
import { OPEN_WALLET_MODAL_EVENT, SAFE_APP_ORIGIN } from '../constants'
import { COW_WIDGET_CONNECTOR_ID } from '../reown/consts'

function reconnectWidgetConnector(): (() => void) | undefined {
  const widgetConnector = config.connectors.find((c) => c.id === COW_WIDGET_CONNECTOR_ID)
  if (!widgetConnector) return undefined

  // Clear stale connections from previous sessions (e.g., EIP-6963 connections from
  // standalone mode) to prevent them from interfering with the widget connector.
  // Without this, switching standalone→dapp leaves the old MetaMask EIP-6963 connection
  // as "current" in wagmi's persisted state, blocking the widget connector.
  config.setState((state) => ({
    ...state,
    connections: new Map(),
    current: null,
    status: 'disconnected',
  }))

  const doReconnect = (): void => {
    // Clear the shimDisconnect flag so reconnect() passes isAuthorized() even if the
    // connector was previously "disconnected" (which can happen on widget recreations).
    void config.storage?.removeItem(`${COW_WIDGET_CONNECTOR_ID}.disconnected`)
    reconnect(config, { connectors: [widgetConnector] })
      .catch((error) => {
        console.debug('[ReconnectOnMount] widget connector reconnect failed', error)
      })
      .finally(() => {
        markInitialReconnectSettled()
      })
  }

  doReconnect()

  // AppKit with enableReconnect=false calls unSyncExistingConnection() during init,
  // which asynchronously disconnects ALL wagmi connections — including the one we just
  // established above. Subscribe to state changes and re-reconnect once if that happens.
  // We track whether we've ever been connected to avoid reacting to the initial clear above.
  let wasConnected = false
  let retried = false
  const unsubscribe = config.subscribe(
    (state) => state.status,
    (status) => {
      if (status === 'connected') {
        wasConnected = true
      }
      if (status === 'disconnected' && wasConnected && !retried) {
        retried = true
        unsubscribe()
        console.debug('[ReconnectOnMount] detected disconnect (likely AppKit unSync), re-reconnecting widget connector')
        doReconnect()
      }
    },
  )

  const timeoutId = setTimeout(() => unsubscribe(), 5000)

  return () => {
    unsubscribe()
    clearTimeout(timeoutId)
  }
}

function ReconnectOnMount({ isOpenInSafeApp }: { isOpenInSafeApp: boolean }): null {
  useEffect((): (() => void) | void => {
    // When running as a pure Safe App (not a widget), skip reconnect and let SafeConnectionHandler
    // handle the wallet — reconnecting a previously saved non-Safe connector first causes a race condition.
    if (isOpenInSafeApp && !isInjectedWidget()) {
      // SafeConnectionHandler drives the connection here; we won't observe a wagmi reconnect lifecycle,
      // so settle immediately to avoid the restoring spinner getting stuck in this context.
      markInitialReconnectSettled()
      return
    }

    if (isInjectedWidget()) {
      // In widget context, use reconnect() (not connect()) to avoid triggering wallet popups.
      // connect() with shimDisconnect=true calls wallet_requestPermissions which shows a MetaMask
      // account selector. reconnect() uses eth_accounts (silent) via isReconnecting=true path.
      // IframeRpcProviderBridge forwards eth_accounts to the parent wallet's provider.
      return reconnectWidgetConnector()
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
          } finally {
            markInitialReconnectSettled()
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
      .finally(() => {
        markInitialReconnectSettled()
      })
  }, [isOpenInSafeApp])

  return null
}

function OpenWalletModalOnCustomEvent(): null {
  useEffect(() => {
    if (!reownAppKit) return
    const appKit = reownAppKit
    const handler = (): void => {
      flushDeferredProviders()
      void appKit.open()
    }
    document.addEventListener(OPEN_WALLET_MODAL_EVENT, handler)
    return () => document.removeEventListener(OPEN_WALLET_MODAL_EVENT, handler)
  }, [])
  return null
}

interface Web3ProviderProps {
  children: ReactNode
  standaloneMode?: boolean
}

export function Web3Provider({ children }: Web3ProviderProps): ReactNode {
  const isOpenInSafeApp = getParentOrigin() === SAFE_APP_ORIGIN

  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <ReconnectOnMount isOpenInSafeApp={isOpenInSafeApp} />
      <OpenWalletModalOnCustomEvent />
      <SafeProvider>
        {isOpenInSafeApp ? <SafeConnectionHandler>{children}</SafeConnectionHandler> : children}
      </SafeProvider>
    </WagmiProvider>
  )
}
