import { useEffect, type ReactNode } from 'react'

import { isImTokenBrowser } from '@cowprotocol/common-utils'
import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { connect, reconnect } from '@wagmi/core'
import { WagmiProvider } from 'wagmi'

import { config, reownAppKit } from './config'
import { SafeConnectionHandler } from './SafeConnectionHandler'

import { getIsInjectedMobileBrowser } from '../api/utils/connection'
import { CONNECT_INJECTED_WALLET_EVENT, OPEN_WALLET_MODAL_EVENT } from '../constants'

const queryClient = new QueryClient()

async function reconnectInjectedConnector(): Promise<void> {
  if (isImTokenBrowser) return

  const injectedConnector = config.connectors.find((connector) => connector.id === 'injected')

  if (!injectedConnector) return

  const provider = await injectedConnector.getProvider()

  if (provider && typeof (provider as { request?: unknown }).request === 'function') {
    const eth = provider as { request: (args: { method: string }) => Promise<unknown> }

    // Seed eth_accounts before reconnect() so wagmi can rehydrate the injected connector.
    await eth.request({ method: 'eth_requestAccounts' })
  }

  const result = await reconnect(config, { connectors: [injectedConnector] })
  console.debug('[reconnectInjectedConnector] result', result)
}

async function connectInjectedConnector(): Promise<void> {
  const injectedConnector = config.connectors.find((connector) => connector.id === 'injected')

  if (!injectedConnector) return

  const result = await connect(config, { connector: injectedConnector })
  console.debug('[connectInjectedConnector] result', result)
}

function ReconnectOnMount(): null {
  useEffect(() => {
    if (getIsInjectedMobileBrowser()) {
      void reconnectInjectedConnector().catch((error: unknown) => {
        console.debug('[ReconnectOnMount] mobile reconnect failed', error)
      })
      return
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

function ConnectInjectedWalletOnCustomEvent(): null {
  useEffect(() => {
    const handler = (): void => {
      void connectInjectedConnector().catch((error: unknown) => {
        console.error('[ConnectInjectedWalletOnCustomEvent] failed', error)
      })
    }

    document.addEventListener(CONNECT_INJECTED_WALLET_EVENT, handler)

    return () => document.removeEventListener(CONNECT_INJECTED_WALLET_EVENT, handler)
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
      <ConnectInjectedWalletOnCustomEvent />
      <QueryClientProvider client={queryClient}>
        <SafeProvider>
          <SafeConnectionHandler>{children}</SafeConnectionHandler>
        </SafeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
