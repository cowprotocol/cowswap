import { SWR_NO_REFRESH_OPTIONS, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'

import useSWR, { SWRResponse } from 'swr'

import { useBridgeProvidersIds } from './useBridgeProvidersIds'

import { bridgingSdk } from '../../tradingSdk/bridgingSdk'

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
        return {
          isRouteAvailable: result.isRouteAvailable,
          tokens: result.tokens.map((token) =>
            TokenWithLogo.fromToken(
              {
                ...token,
                name: token.name || '',
                symbol: token.symbol || '',
              },
              token.logoUrl,
            ),
          ),
        }
      })
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
