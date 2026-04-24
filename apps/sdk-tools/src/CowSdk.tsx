import { ReactNode, useEffect } from 'react'

import { AbstractProviderAdapter, setGlobalAdapter } from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { usePublicClient, useWalletClient } from 'wagmi'

export function CowSdk({ children }: { children: ReactNode }): ReactNode {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    if (!publicClient) return
    if (walletClient) {
      // TODO: fix the type casting
      setGlobalAdapter(new ViemAdapter({ provider: publicClient, walletClient }) as AbstractProviderAdapter)
    } else {
      setGlobalAdapter(new ViemAdapter({ provider: publicClient, signer: PERMIT_ACCOUNT }) as AbstractProviderAdapter)
    }
  }, [publicClient, walletClient])

  return children
}
