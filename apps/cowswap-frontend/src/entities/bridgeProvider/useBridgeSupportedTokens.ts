import { SWR_NO_REFRESH_OPTIONS, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'

import useSWR, { SWRResponse } from 'swr'

import { useBridgeProvider } from './useBridgeProvider'

export function useBridgeSupportedTokens(params: BuyTokensParams | undefined): SWRResponse<TokenWithLogo[] | null> {
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
        .then((tokens) => {
          return (
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
            )
          )
        })
        .catch((error) => {
          console.error('Cannot getBuyTokens from bridgeProvider', error)
          return Promise.reject(error)
        })
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
