import { TokenWithLogo } from '@cowprotocol/common-const'

import useSWR from 'swr'

import { useBridgeProvider } from './useBridgeProvider'

export function useBridgeSupportedTokens(chainId: number | undefined) {
  const bridgeProvider = useBridgeProvider()

  return useSWR([bridgeProvider, chainId], ([bridgeProvider, chainId]) => {
    if (typeof chainId === 'undefined') return null

    return bridgeProvider.getTokens(chainId).then((tokens) => {
      return tokens && tokens.map((token) => TokenWithLogo.fromToken(token, token.logoURI))
    })
  })
}
