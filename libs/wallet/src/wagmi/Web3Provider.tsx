import { useEffect, type ReactNode } from 'react'

import { WagmiProvider } from 'wagmi'

import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { reownAppKit, wagmiAdapter } from './config'

import { OPEN_WALLET_MODAL_EVENT, type OpenWalletModalEventDetail } from '../constants'
import { flushDeferredProviders } from '../providerIsolation'

interface Web3ProviderProps {
  children: ReactNode
  standaloneMode?: boolean
}

export function Web3Provider({ children }: Web3ProviderProps): ReactNode {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} reconnectOnMount={false}>
      <OpenWalletModalOnCustomEvent />
      <SafeProvider>{children}</SafeProvider>
    </WagmiProvider>
  )
}

function OpenWalletModalOnCustomEvent(): null {
  useEffect(() => {
    const handler = (event: Event): void => {
      const detail: OpenWalletModalEventDetail | undefined = event instanceof CustomEvent ? event.detail : undefined
      reownAppKit?.open({ view: 'Connect', namespace: detail?.namespace })
      flushDeferredProviders()
    }
    document.addEventListener(OPEN_WALLET_MODAL_EVENT, handler)
    return () => document.removeEventListener(OPEN_WALLET_MODAL_EVENT, handler)
  }, [])
  return null
}
