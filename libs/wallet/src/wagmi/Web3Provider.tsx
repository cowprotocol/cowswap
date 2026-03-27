import { useEffect, type ReactNode } from 'react'

import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { reconnect } from '@wagmi/core'
import { WagmiProvider } from 'wagmi'

import { config, reownAppKit } from './config'
import { SafeConnectionHandler } from './SafeConnectionHandler'

import { OPEN_WALLET_MODAL_EVENT } from '../constants'

const queryClient = new QueryClient()

function ReconnectOnMount(): null {
  useEffect(() => {
    void reconnect(config).catch(() => {})
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
