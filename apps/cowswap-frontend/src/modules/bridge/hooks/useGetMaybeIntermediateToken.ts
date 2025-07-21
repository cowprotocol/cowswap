import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { BridgeQuoteResults, OrderKind } from '@cowprotocol/cow-sdk'
import { useSearchToken } from '@cowprotocol/tokens'

import { useGetIntermediateSellTokenIfExists } from '../../trade/hooks/useGetIntermediateSellTokenIfExists'

interface UseGetMaybeIntermediateTokenProps {
  bridgeQuote: BridgeQuoteResults | null
}

// returns the intermediate buy token (if it exists) and if it should be imported
export function useGetMaybeIntermediateToken({ bridgeQuote }: UseGetMaybeIntermediateTokenProps): {
  intermediateBuyToken: TokenWithLogo | null
  toBeImported: boolean
} {
  const { sellTokenAddress: intermediateBuyTokenAddress } = bridgeQuote?.tradeParameters || {}
  const orderParams = getOrderParamsFromQuote(bridgeQuote)

  const intermediateBuyToken = useGetIntermediateSellTokenIfExists(orderParams) ?? null
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

function getOrderParamsFromQuote(bridgeQuote: BridgeQuoteResults | null): { kind: OrderKind; buyToken: string } | undefined {
  const { sellTokenAddress: buyToken, kind } = bridgeQuote?.tradeParameters || {}
  if (!buyToken || !kind) return undefined

  return { kind, buyToken }
}
