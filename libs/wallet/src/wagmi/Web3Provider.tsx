import { useEffect, type ReactNode } from 'react'

import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { WagmiProvider } from 'wagmi'

import { reownAppKit, wagmiAdapter } from './config'

import { OPEN_WALLET_MODAL_EVENT } from '../constants'
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
    const handler = (): void => {
      reownAppKit?.open({ view: 'Connect' })
      flushDeferredProviders()
    }
    document.addEventListener(OPEN_WALLET_MODAL_EVENT, handler)
    return () => document.removeEventListener(OPEN_WALLET_MODAL_EVENT, handler)
  }, [])
  return null
}
