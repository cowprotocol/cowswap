import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { BridgeQuoteResults } from '@cowprotocol/cow-sdk'
import { useSearchToken, useTokensByAddressMap } from '@cowprotocol/tokens'

interface UseGetMaybeIntermediateTokenProps {
  bridgeQuote: BridgeQuoteResults | null
}

// returns the intermediate buy token (if it exists) and if it should be imported
export function useGetMaybeIntermediateToken({ bridgeQuote }: UseGetMaybeIntermediateTokenProps): {
  intermediateBuyToken: TokenWithLogo | null
  toBeImported: boolean
} {
  const { sellTokenAddress: intermediateBuyTokenAddress } = bridgeQuote?.tradeParameters || {}
  const tokensByAddress = useTokensByAddressMap()

  const { inactiveListsResult, blockchainResult, activeListsResult, externalApiResult, isLoading } = useSearchToken(
    intermediateBuyTokenAddress || null,
  )

  const intermediateBuyToken =
    (intermediateBuyTokenAddress && tokensByAddress[intermediateBuyTokenAddress.toLowerCase()]) || null

  const temporaryIntermediateBuyTokenList = useMemo(() => {
    if (isLoading) return []

    const allTokensMap = [
      ...inactiveListsResult,
      ...blockchainResult,
      ...activeListsResult,
      ...externalApiResult,
    ].reduce((map, token) => {
      const addressLower = token.address.toLowerCase()
      if (!map.has(addressLower)) {
        map.set(addressLower, token)
      }
      return map
    }, new Map<string, TokenWithLogo>())
    return Array.from(allTokensMap.values())
  }, [inactiveListsResult, blockchainResult, activeListsResult, externalApiResult, isLoading])

  if (!intermediateBuyTokenAddress) {
    return { intermediateBuyToken: null, toBeImported: false }
  }

  if (!intermediateBuyToken && temporaryIntermediateBuyTokenList.length > 0) {
    return {
      intermediateBuyToken: temporaryIntermediateBuyTokenList[0],
      toBeImported: true,
    }
  }

  return { intermediateBuyToken, toBeImported: false }
}
