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
    // Use RPC node provider instead of wallet provider only when there is a custom chainId in the context
    // AND the context chainId differs from wallet chainId
    if (contextChainId && contextChainId !== walletChainId) {
      return getRpcProvider(contextChainId)
    }

    // If wallet provider is unavailable or cannot report network, fall back to RPC for the wallet chain
    if (!provider && walletChainId) {
      return getRpcProvider(walletChainId)
    }

    return provider
  }, [contextChainId, walletChainId, provider])
}
