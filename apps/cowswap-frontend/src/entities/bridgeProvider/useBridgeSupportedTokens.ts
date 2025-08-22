import { SWR_NO_REFRESH_OPTIONS, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { BuyTokensParams, GetProviderBuyTokens } from '@cowprotocol/cow-sdk'

import useSWR, { SWRResponse } from 'swr'

import { useBridgeProvider } from './useBridgeProvider'

export type BridgeSupportedToken = Pick<GetProviderBuyTokens, 'isRouteAvailable'> & { tokens: TokenWithLogo[] }

export function useBridgeSupportedTokens(
  params: BuyTokensParams | undefined,
): SWRResponse<BridgeSupportedToken | null> {
  const isBridgingEnabled = useIsBridgingEnabled()
  const bridgeProvider = useBridgeProvider()

  return useSWR(
    isBridgingEnabled
      ? [
          params,
          params?.sellChainId,
          params?.buyChainId,
          params?.sellTokenAddress,
          bridgeProvider.info.dappId,
          'useBridgeSupportedTokens',
        ]
      : null,
    ([params]) => {
      if (typeof params === 'undefined') return null

      return bridgeProvider
        .getBuyTokens(params)
        .then(({ tokens, isRouteAvailable }) => {
          return {
            tokens:
              tokens &&
              tokens.map((token) =>
                TokenWithLogo.fromToken(
                  {
                    ...token,
                    name: token.name || '',
                    symbol: token.symbol || '',
                  },
                  token.logoUrl,
                ),
              ),
            isRouteAvailable: isBridgingEnabled ? isRouteAvailable : true,
          }
        })
        .catch((error) => {
          console.error('Cannot getBuyTokens from bridgeProvider', error)
          return Promise.reject(error)
        })
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
