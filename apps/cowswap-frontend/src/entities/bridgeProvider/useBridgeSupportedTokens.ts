import { SWR_NO_REFRESH_OPTIONS, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'
import { useTokensByAddressMapForChain } from '@cowprotocol/tokens'

import useSWR, { SWRResponse } from 'swr'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { useBridgeProvidersIds } from './useBridgeProvidersIds'

export type BridgeSupportedToken = { tokens: TokenWithLogo[]; isRouteAvailable: boolean }

export function useBridgeSupportedTokens(
  params: BuyTokensParams | undefined,
): SWRResponse<BridgeSupportedToken | null> {
  const isBridgingEnabled = useIsBridgingEnabled()
  const providerIds = useBridgeProvidersIds()
  const key = providerIds.join('|')

  // Get token map from token lists for the destination chain to fallback for missing logos
  const tokensByAddress = useTokensByAddressMapForChain(params?.buyChainId as SupportedChainId | undefined)
  const tokenListSize = Object.keys(tokensByAddress).length

  return useSWR(
    isBridgingEnabled
      ? [
          params,
          params?.sellChainId,
          params?.buyChainId,
          params?.sellTokenAddress,
          key,
          tokenListSize,
          'useBridgeSupportedTokens',
        ]
      : null,
    async ([params]) => {
      if (typeof params === 'undefined') return null

      return bridgingSdk.getBuyTokens(params).then((result) => {
        const tokens = result.tokens.reduce<TokenWithLogo[]>((acc, token) => {
          if (!token || token.chainId === undefined || !token.address) {
            console.warn('[bridgeTokens] Ignoring malformed token', token)
            return acc
          }

          // Fallback to token list logo if bridge doesn't provide one
          const listToken = tokensByAddress[token.address.toLowerCase()]
          const logoUrl = token.logoUrl || listToken?.logoURI

          acc.push(
            TokenWithLogo.fromToken(
              {
                ...token,
                name: token.name || '',
                symbol: token.symbol || '',
              },
              logoUrl,
            ),
          )

          return acc
        }, [])
        const isRouteAvailable = tokens.length > 0 ? result.isRouteAvailable : false

        return {
          isRouteAvailable,
          tokens,
        }
      })
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
