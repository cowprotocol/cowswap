import { useAtomValue } from 'jotai/index'
import { useMemo } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { Nullish } from '@cowprotocol/types'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { JsonRpcProvider } from '@ethersproject/providers'

import ms from 'ms.macro'
import { useAsyncMemo } from 'use-async-memo'

import { multiCallContextAtom } from '../state/multiCallContextAtom'

const PROVIDER_DEBOUNCE = ms`2s`

export function useMultiCallRpcProvider(): Nullish<JsonRpcProvider> {
  const provider = useWalletProvider()
  const context = useAtomValue(multiCallContextAtom)

  const contextChainId = context?.chainId

  const walletChainId = useAsyncMemo(async () => {
    if (!provider) return undefined

    return +(await provider.getNetwork()).chainId
  }, [provider])

  const multicallProvider = useMemo(() => {
    if (!contextChainId || !walletChainId) return null

    // Use wallet provider if current network matches the wallet network
    if (walletChainId === contextChainId) {
      return provider
    }

    // Otherwise use RPC node
    return getRpcProvider(contextChainId)
  }, [contextChainId, walletChainId, provider])

  /**
   * Due to network changes, there might a race condition between walletChainId and contextChainId
   * To avoid flickering, we debounce the result provider for 0.5s, it's more than enough for a moment of network change
   */
  return useDebounce(multicallProvider, PROVIDER_DEBOUNCE)
}
