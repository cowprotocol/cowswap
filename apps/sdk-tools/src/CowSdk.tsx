import { ReactNode, useEffect } from 'react'

import { usePublicClient, useWalletClient } from 'wagmi'

import { AbstractProviderAdapter, setGlobalAdapter } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { privateKeyToAccount } from 'viem/accounts'

const PERMIT_PK = '0xa50dc0f7fc051309434deb3b1c71e927dbb711759231d8ecbf630c85d94a42fe' // address: 0xDa5F16F4ab0410096a4403e7223988649fac38cF
const PERMIT_ACCOUNT = privateKeyToAccount(PERMIT_PK)

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
