import { ReactNode, useEffect } from 'react'

import { LAUNCH_DARKLY_VIEM_MIGRATION } from '@cowprotocol/common-const'
import { SafeProvider } from '@safe-global/safe-apps-react-sdk'

import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

import { appKitParams, wagmiAdapter } from './config'

const queryClient = new QueryClient()

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps): React.ReactNode {
  useEffect(() => {
    if (LAUNCH_DARKLY_VIEM_MIGRATION) {
      // TODO M-7 COW-572
      // This will be moved back to config file on cleanup
      const appKit = createAppKit(appKitParams)

      appKit.updateFeatures({
        connectorTypeOrder: ['recent', 'injected', 'featured', 'custom', 'external', 'recommended', 'walletConnect'],
      })
      appKit.close
    }
  }, [])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SafeProvider>{children}</SafeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
