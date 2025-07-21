import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { BridgeQuoteResults, OrderKind } from '@cowprotocol/cow-sdk'
import { useSearchToken } from '@cowprotocol/tokens'

import { useTryFindIntermediateTokenInTokensMap } from 'modules/trade'

interface UseGetMaybeIntermediateTokenProps {
  bridgeQuote: BridgeQuoteResults | null
}

// returns the intermediate buy token (if it exists) and if it should be imported
export function useTryFindIntermediateToken({ bridgeQuote }: UseGetMaybeIntermediateTokenProps): {
  intermediateBuyToken: TokenWithLogo | null
  toBeImported: boolean
} {
  const { sellTokenAddress: intermediateBuyTokenAddress, kind } = bridgeQuote?.tradeParameters || {}
  const orderParams = useMemo(
    () => getOrderParamsFromQuote(intermediateBuyTokenAddress, kind),
    [intermediateBuyTokenAddress, kind]
  )
  const intermediateBuyToken = useTryFindIntermediateTokenInTokensMap(orderParams) ?? null
  const { inactiveListsResult, blockchainResult, externalApiResult, isLoading } = useSearchToken(
    intermediateBuyToken ? null : intermediateBuyTokenAddress || null,
  )

  const tokenSearchResult = useMemo(() => {
    if (isLoading || intermediateBuyToken) return []

    const allTokensMap = [...inactiveListsResult, ...blockchainResult, ...externalApiResult].reduce((map, token) => {
      const addressLower = token.address.toLowerCase()
      if (!map.has(addressLower)) {
        map.set(addressLower, token)
      }
      return map
    }, new Map<string, TokenWithLogo>())
    return Array.from(allTokensMap.values())
  }, [inactiveListsResult, blockchainResult, externalApiResult, isLoading, intermediateBuyToken])

  if (!intermediateBuyTokenAddress) {
    return { intermediateBuyToken: null, toBeImported: false }
  }

  if (!intermediateBuyToken && tokenSearchResult.length > 0) {
    return {
      intermediateBuyToken: tokenSearchResult[0],
      toBeImported: true,
    }
  }

  return { intermediateBuyToken, toBeImported: false }
}

function getOrderParamsFromQuote(buyToken?: string, kind?: OrderKind):
  { kind: OrderKind; buyToken: string } | undefined {
  if (!buyToken || !kind) return undefined

  return { kind, buyToken }
}
