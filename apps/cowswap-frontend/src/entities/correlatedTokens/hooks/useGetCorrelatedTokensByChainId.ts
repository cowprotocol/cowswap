import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { correlatedTokensAtom } from '../state/correlatedTokensAtom'

export function useGetCorrelatedTokensByChainId(): (chainId: SupportedChainId) => Promise<string[]> {
  const correlatedTokensByChain = useAtomValue(correlatedTokensAtom)

  return useCallback(
    async (chainId: SupportedChainId) => {
      const tokens = correlatedTokensByChain[chainId]

      if (!tokens) return []

      return [
        ...new Set(
          tokens.flatMap((token) => {
            return Object.keys(token).map((address) => address.toLowerCase())
          }),
        ).values(),
      ]
    },
    [correlatedTokensByChain],
  )
}
