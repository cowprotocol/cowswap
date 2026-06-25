import { useEffect, type ReactNode } from 'react'

import { isImTokenBrowser, isInjectedWidget } from '@cowprotocol/common-utils'
import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reconnect } from '@wagmi/core'
import { WagmiProvider } from 'wagmi'

import { reownAppKit, wagmiAdapter } from './config'

import { getIsInjectedMobileBrowser } from '../api/utils/connection'
import { OPEN_WALLET_MODAL_EVENT } from '../constants'
import { flushDeferredProviders } from '../providerIsolation'

const queryClient = new QueryClient()

interface Web3ProviderProps {
  children: ReactNode
  standaloneMode?: boolean
}

export function Web3Provider({ children }: Web3ProviderProps): ReactNode {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} reconnectOnMount={false}>
      <ReconnectInjectedMobileOnMount />
      <OpenWalletModalOnCustomEvent />
      <QueryClientProvider client={queryClient}>
        <SafeProvider>{children}</SafeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function ReconnectInjectedMobileOnMount(): null {
  useEffect(() => {
    if (!getIsInjectedMobileBrowser() || isInjectedWidget() || isImTokenBrowser) return

    const injectedConnector = wagmiAdapter.wagmiConfig.connectors.find((connector) => connector.id === 'injected')
    if (!injectedConnector) return

    void (async () => {
      try {
        const provider = await injectedConnector.getProvider()
        const eth = provider as { request?: (args: { method: string }) => Promise<unknown> } | undefined

        if (eth?.request) {
          await eth.request({ method: 'eth_requestAccounts' })
        }

        await reconnect(wagmiAdapter.wagmiConfig, { connectors: [injectedConnector] })
      } catch (error) {
        console.debug('[ReconnectInjectedMobileOnMount] reconnect failed', error)
      }
    })()
  }, [])

  return null
}

function OpenWalletModalOnCustomEvent(): null {
  useEffect(() => {
    const handler = (): void => {
      reownAppKit?.open({ view: 'Connect' })
      flushDeferredProviders()
    }
    document.addEventListener(OPEN_WALLET_MODAL_EVENT, handler)
    return () => document.removeEventListener(OPEN_WALLET_MODAL_EVENT, handler)
  }, [])
  return null
}
