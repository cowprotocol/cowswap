import { useEffect, type ReactNode } from 'react'

import { isImTokenBrowser } from '@cowprotocol/common-utils'
import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reconnect } from '@wagmi/core'
import { WagmiProvider } from 'wagmi'

import { config, IS_CROSS_ORIGIN_IFRAME, reownAppKit } from './config'
import { SafeConnectionHandler } from './SafeConnectionHandler'

import { getIsInjectedMobileBrowser } from '../api/utils/connection'
import { OPEN_WALLET_MODAL_EVENT } from '../constants'

const queryClient = new QueryClient()

function ReconnectOnMount(): null {
  useEffect(() => {
    // In Safe iframe, SafeConnectionHandler handles connection — skip generic reconnect
    // to avoid briefly restoring a non-Safe connector from shared storage.
    if (IS_CROSS_ORIGIN_IFRAME) return

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
    const appKit = reownAppKit
    if (!appKit) return

    const handler = (): void => {
      void appKit.open()
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
    <WagmiProvider config={config}>
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
