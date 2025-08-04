import { useAtomValue } from 'jotai/index'

import { getRpcProvider } from '@cowprotocol/common-const'
import { Nullish } from '@cowprotocol/types'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { JsonRpcProvider } from '@ethersproject/providers'

import { useAsyncMemo } from 'use-async-memo'

import { multiCallContextAtom } from '../state/multiCallContextAtom'

export function useMultiCallRpcProvider(): Nullish<JsonRpcProvider> {
  const provider = useWalletProvider()
  const context = useAtomValue(multiCallContextAtom)

  return useAsyncMemo(async () => {
    if (!context || !provider) return null

    const walletChainId = +(await provider.getNetwork()).chainId

    // Use wallet provider if current network matches the wallet network
    if (walletChainId === context.chainId) {
      return provider
    }

    // Otherwise use RPC node
    return getRpcProvider(context.chainId)
  }, [context, provider])
}
