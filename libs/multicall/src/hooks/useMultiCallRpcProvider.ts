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
    // We need to use our RPC node provider instead of wallet provider
    // when we need to make calls on other chains (e.g. balances)
    // if that is the case contextChainId is going to be defined and different from walletChainId
    // but just to be sure let's keep this existing comparison
    if (contextChainId && contextChainId !== walletChainId) {
      return getRpcProvider(contextChainId)
    }

    return provider
  }, [contextChainId, walletChainId, provider])
}
