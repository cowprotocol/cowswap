import { useAtomValue } from 'jotai/index'
import { useMemo } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { JsonRpcProvider } from '@ethersproject/providers'

import { multiCallContextAtom } from '../state/multiCallContextAtom'

export function useMultiCallRpcProvider(): JsonRpcProvider | null {
  const provider = useWalletProvider()
  const context = useAtomValue(multiCallContextAtom)

  return useMemo(() => {
    if (!context || !provider) return null

    const walletChainId = provider.network?.chainId

    // Use wallet provider if current network matches the wallet network
    if (walletChainId === context.chainId) {
      return provider
    }

    // Otherwise use RPC node
    return getRpcProvider(context.chainId)
  }, [context, provider])
}
