import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenInfo } from '@cowprotocol/types'
import { Token } from '@uniswap/sdk-core'

import {
  getTokenId,
  RestrictedTokenListState,
  restrictedTokensAtom,
} from '../../state/restrictedTokens/restrictedTokensAtom'

export interface RestrictedTokenInfo {
  token: TokenInfo
  restrictedCountries: string[]
  consentHash: string
}

export function findRestrictedToken(
  token: Token | undefined,
  restrictedList: RestrictedTokenListState,
): RestrictedTokenInfo | undefined {
  if (!token) return undefined

  const tokenId = getTokenId({ chainId: token.chainId, address: token.address })
  const foundToken = restrictedList.tokensMap[tokenId]

  if (!foundToken) return undefined

  return {
    token: foundToken,
    restrictedCountries: restrictedList.countriesPerToken[tokenId] ?? [],
    consentHash: restrictedList.consentHashPerToken[tokenId] ?? '',
  }
}

export function useRestrictedToken(token: Token | undefined): RestrictedTokenInfo | undefined {
  const restrictedList = useAtomValue(restrictedTokensAtom)

  return useMemo(() => {
    if (!restrictedList.isLoaded) return undefined

    return findRestrictedToken(token, restrictedList)
  }, [token, restrictedList])
}

export function useAnyRestrictedToken(
  inputToken: Token | undefined,
  outputToken: Token | undefined,
): RestrictedTokenInfo | undefined {
  const inputTokenInfo = useRestrictedToken(inputToken)
  const outputTokenInfo = useRestrictedToken(outputToken)

  return useMemo(() => {
    return inputTokenInfo ?? outputTokenInfo
  }, [inputTokenInfo, outputTokenInfo])
}
