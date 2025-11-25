import { SWR_NO_REFRESH_OPTIONS, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'

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

  return useSWR(
    isBridgingEnabled
      ? [params, params?.sellChainId, params?.buyChainId, params?.sellTokenAddress, key, 'useBridgeSupportedTokens']
      : null,
    async ([params]) => {
      if (typeof params === 'undefined') return null

      return bridgingSdk.getBuyTokens(params).then((result) => {
        const tokens = result.tokens.reduce<TokenWithLogo[]>((acc, token) => {
          if (!token || token.chainId === undefined || !token.address) {
            console.warn('[bridgeTokens] Ignoring malformed token', token)
            return acc
          }

          acc.push(
            TokenWithLogo.fromToken(
              {
                ...token,
                name: token.name || '',
                symbol: token.symbol || '',
              },
              token.logoUrl,
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
