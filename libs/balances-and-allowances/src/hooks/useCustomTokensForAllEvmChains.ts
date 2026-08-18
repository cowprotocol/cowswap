import { useMemo } from 'react'

import { AddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useUserAddedTokens } from '@cowprotocol/tokens'

import { selectCustomTokensForChain } from './useCustomTokensForChain'

import { EVM_CHAIN_IDS } from '../const/evmChainIds'

/**
 * Dense, per-EVM-chain map of user-imported token addresses — one entry per
 * `EVM_CHAIN_IDS` member, `[]` where the user hasn't imported anything on
 * that chain. Reads `useUserAddedTokens()` once and slices it per chain,
 * instead of calling `useCustomTokensForChain` in a loop.
 */
export function useCustomTokensForAllEvmChains(): Record<SupportedChainId, AddressKey[]> {
  const userAddedTokens = useUserAddedTokens()

  return useMemo(() => {
    const result = {} as Record<SupportedChainId, AddressKey[]>
    for (const chainId of EVM_CHAIN_IDS) {
      result[chainId] = selectCustomTokensForChain(userAddedTokens, chainId)
    }
    return result
  }, [userAddedTokens])
}
