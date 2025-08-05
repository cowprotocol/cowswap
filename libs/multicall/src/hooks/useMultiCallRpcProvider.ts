import { useAtomValue } from 'jotai/index'
import { useMemo } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { Nullish } from '@cowprotocol/types'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { JsonRpcProvider } from '@ethersproject/providers'

import { useAsyncMemo } from 'use-async-memo'

import { multiCallContextAtom } from '../state/multiCallContextAtom'

export function useMultiCallRpcProvider(): Nullish<JsonRpcProvider> {
  const provider = useWalletProvider()
  const context = useAtomValue(multiCallContextAtom)

  const contextChainId = context?.chainId

  const walletChainId = useAsyncMemo(async () => {
    if (!provider) return undefined

    return +(await provider.getNetwork()).chainId
  }, [provider])

  return useMemo(() => {
    // Use RPC node provider instead of wallet provider only when there is a custom chainId in the context
    // AND the context chainId differs from wallet chainId
    if (contextChainId && contextChainId !== walletChainId) {
      return getRpcProvider(contextChainId)
    }

    return provider
  }, [contextChainId, walletChainId, provider])
}
