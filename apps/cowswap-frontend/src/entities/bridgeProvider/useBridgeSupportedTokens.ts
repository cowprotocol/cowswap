import { TokenWithLogo } from '@cowprotocol/common-const'

import useSWR from 'swr'

import { useBridgeProvider } from './useBridgeProvider'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useBridgeSupportedTokens(chainId: number | undefined) {
  const bridgeProvider = useBridgeProvider()

  return useSWR([bridgeProvider, chainId, 'useBridgeSupportedTokens'], ([bridgeProvider, chainId]) => {
    if (typeof chainId === 'undefined') return null

    return bridgeProvider
      .getBuyTokens(chainId)
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
  })
}
