import { SWR_NO_REFRESH_OPTIONS, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'

import useSWR, { SWRResponse } from 'swr'

import { useBridgeProviders } from './useBridgeProviders'

export type BridgeSupportedToken = { tokens: TokenWithLogo[]; isRouteAvailable: boolean }

export function useBridgeSupportedTokens(
  params: BuyTokensParams | undefined,
): SWRResponse<BridgeSupportedToken | null> {
  const isBridgingEnabled = useIsBridgingEnabled()

  const bridgeProviders = useBridgeProviders()
  const providerIds = bridgeProviders.map((i) => i.info.dappId).join('|')

  return useSWR(
    isBridgingEnabled
      ? [
          params,
          params?.sellChainId,
          params?.buyChainId,
          params?.sellTokenAddress,
          providerIds,
          'useBridgeSupportedTokens',
        ]
      : null,
    async ([params]) => {
      if (typeof params === 'undefined') return null

      const results = await Promise.allSettled(
        bridgeProviders.map((provider) => {
          return provider.getBuyTokens(params)
        }),
      )

      const state = results.reduce<{ tokens: Record<string, TokenWithLogo>; isRouteAvailable: boolean }>(
        (acc, val) => {
          if (val.status === 'fulfilled') {
            const { tokens, isRouteAvailable } = val.value

            if (isRouteAvailable) {
              tokens.forEach((token) => {
                const address = token.address.toLowerCase()

                if (!acc.tokens[address]) {
                  acc.tokens[address] = TokenWithLogo.fromToken(
                    {
                      ...token,
                      name: token.name || '',
                      symbol: token.symbol || '',
                    },
                    token.logoUrl,
                  )
                }
              })

              acc.isRouteAvailable = isBridgingEnabled ? isRouteAvailable : true
            }
          }

          return acc
        },
        { isRouteAvailable: false, tokens: {} },
      )
      return {
        isRouteAvailable: state.isRouteAvailable,
        tokens: Object.values(state.tokens),
      }
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
