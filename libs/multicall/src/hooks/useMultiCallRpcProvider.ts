import { useAtomValue } from 'jotai/index'
import { useMemo } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { Nullish } from '@cowprotocol/types'
import { useWalletChainId, useWalletProvider } from '@cowprotocol/wallet-provider'
import { JsonRpcProvider } from '@ethersproject/providers'

import { multiCallContextAtom } from '../state/multiCallContextAtom'

export function useMultiCallRpcProvider(): Nullish<JsonRpcProvider> {
  const provider = useWalletProvider()
  const walletChainId = useWalletChainId()
  const context = useAtomValue(multiCallContextAtom)

  const contextChainId = context?.chainId

  return useMemo(() => {
    // Prefer RPC provider when a chainId is known (context overrides wallet)
    if (contextChainId) {
      return getRpcProvider(contextChainId)
    }
    if (walletChainId) {
      return getRpcProvider(walletChainId)
    }

    // Fallback to wallet provider if no chainId is available yet
    return provider
  }, [contextChainId, walletChainId, provider])
}
