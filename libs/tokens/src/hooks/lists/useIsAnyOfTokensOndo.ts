import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { Token } from '@uniswap/sdk-core'

import { getTokenId, restrictedTokensAtom } from '../../state/restrictedTokens/restrictedTokensAtom'

export function useIsAnyOfTokensOndo(firstToken: Token | undefined, secondToken: Token | undefined): Token | undefined {
  const restrictedList = useAtomValue(restrictedTokensAtom)

  return useMemo(() => {
    if (!firstToken && !secondToken) return undefined
    if (!restrictedList.isLoaded) return undefined

    if (firstToken) {
      const tokenId = getTokenId(firstToken.chainId, firstToken.address)
      if (restrictedList.tokensMap[tokenId]) return firstToken
    }

    if (secondToken) {
      const tokenId = getTokenId(secondToken.chainId, secondToken.address)
      if (restrictedList.tokensMap[tokenId]) return secondToken
    }

    return undefined
  }, [firstToken, secondToken, restrictedList])
}
