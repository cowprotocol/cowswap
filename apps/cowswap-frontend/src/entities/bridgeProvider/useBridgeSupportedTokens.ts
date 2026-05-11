import { SWR_NO_REFRESH_OPTIONS, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { ALL_CHAINS_MAP, getAddressKey, isSupportedAddress, TargetChainId } from '@cowprotocol/cow-sdk'
import { BuyTokensParams, GetProviderBuyTokens } from '@cowprotocol/sdk-bridging'
import { TokensByAddress, useTokensByAddressMapForChain } from '@cowprotocol/tokens'

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
  const tokensByAddress = useTokensByAddressMapForChain(params?.buyChainId)
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

      try {
        const result = await bridgingSdk.getBuyTokens(params)

        const tokens = result.tokens.reduce<TokenWithLogo[]>(
          (acc, token) => collectBridgeToken(acc, token, tokensByAddress),
          [],
        )
        const isRouteAvailable = tokens.length > 0 ? result.isRouteAvailable : false

        return { isRouteAvailable, tokens }
      } catch (error) {
        // Treat failures as "no route" to avoid leaving the UI in an inconsistent cross-chain state
        // (e.g. stale targetChainId + output token from a previous selection).
        console.warn('[bridgeTokens] Failed to fetch buy tokens', error)
        return { isRouteAvailable: false, tokens: [] }
      }
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}

type BridgeTokenItem = GetProviderBuyTokens['tokens'][number]

function resolveTokenAddressAndLogo(
  token: BridgeTokenItem,
  tokensByAddress: TokensByAddress,
): { address: string; logoUrl: string | undefined } | null {
  const nativeCurrency = ALL_CHAINS_MAP[token.chainId as TargetChainId].nativeCurrency
  // Bridge providers may return non-EVM native tokens without an address, or with a junk placeholder
  // (e.g. NEAR Intents returns BTC native with contractAddress="coin"). In either case, fall back
  // to our convention native address from the SDK so downstream code (shortenAddress, explorer
  // links, address comparisons) keeps working.
  const address = isSupportedAddress(token.address) ? token.address : nativeCurrency?.address
  if (!address) return null

  const listToken = tokensByAddress[getAddressKey(address)]
  const logoUrl = listToken?.logoURI || token.logoUrl || nativeCurrency?.logoUrl
  return { address, logoUrl }
}

function collectBridgeToken(
  acc: TokenWithLogo[],
  token: BridgeTokenItem | null | undefined,
  tokensByAddress: TokensByAddress,
): TokenWithLogo[] {
  if (!token || token.chainId === undefined) {
    console.warn('[bridgeTokens] Ignoring malformed token', token)
    return acc
  }

  const resolved = resolveTokenAddressAndLogo(token, tokensByAddress)
  if (!resolved) {
    console.warn('[bridgeTokens] Ignoring token with no address', token)
    return acc
  }

  acc.push(
    TokenWithLogo.fromToken(
      { ...token, address: resolved.address, name: token.name || '', symbol: token.symbol || '' },
      resolved.logoUrl,
    ),
  )

  return acc
}
