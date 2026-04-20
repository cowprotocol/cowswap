import { useEffect, type ReactNode } from 'react'

import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reconnect, WagmiProvider } from 'wagmi'

import { config, reownAppKit } from './config'
import { SafeConnectionHandler } from './SafeConnectionHandler'

import { getIsInjectedMobileBrowser } from '../api/utils/connection'
import { OPEN_WALLET_MODAL_EVENT } from '../constants'

const queryClient = new QueryClient()

function ReconnectOnMount(): null {
  useEffect(() => {
    // When running inside a mobile in-app browser (e.g. MetaMask iOS), window.ethereum is
    // injected but there may be no prior wagmi session in localStorage. We call
    // eth_requestAccounts directly on the provider first — MetaMask iOS auto-approves this
    // since the user is already inside the app. Once approved, eth_accounts returns the
    // accounts, so the subsequent reconnect() call succeeds through the normal wagmi/AppKit
    // flow (avoiding the AppKit state-sync conflict that calling connect() directly causes).
    if (getIsInjectedMobileBrowser()) {
      const injectedConnector = config.connectors.find((c) => c.id === 'injected')

      if (injectedConnector) {
        void (async () => {
          try {
            const provider = await injectedConnector.getProvider()
            if (provider && typeof (provider as { request?: unknown }).request === 'function') {
              await (provider as { request: (args: { method: string }) => Promise<unknown> }).request({
                method: 'eth_requestAccounts',
              })
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
      .then((res) => {
        console.debug('[ReconnectOnMount] result', res)
      })
      .catch((error) => {
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
