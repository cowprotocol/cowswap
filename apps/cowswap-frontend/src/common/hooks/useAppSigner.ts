import { useMemo } from 'react'

import type { Signer } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { usePublicClient, useWalletClient } from 'wagmi'

/**
 * Returns the signer derived from Wagmi (walletClient + publicClient) for app flows
 * that do not depend on the global SDK adapter (e.g. order cancellation).
 * Use this in app context instead of getGlobalAdapter().signer.
 */
export function useAppSigner(): Signer | undefined {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  return useMemo(() => {
    if (!publicClient || !walletClient) return undefined
    const adapter = new ViemAdapter({ provider: publicClient, walletClient })
    return adapter.signer
  }, [publicClient, walletClient])
}
