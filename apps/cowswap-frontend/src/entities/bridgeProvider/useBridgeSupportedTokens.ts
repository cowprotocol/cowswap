import { SWR_NO_REFRESH_OPTIONS, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { ALL_CHAINS_MAP, getAddressKey, TargetChainId } from '@cowprotocol/cow-sdk'
import { BuyTokensParams, GetProviderBuyTokens } from '@cowprotocol/sdk-bridging'
import { TokensByAddress, useTokensByAddressMapForChain } from '@cowprotocol/tokens'

import useSWR, { SWRResponse } from 'swr'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { useBridgeProvidersIds } from './useBridgeProvidersIds'

export type BridgeSupportedToken = { tokens: TokenWithLogo[]; isRouteAvailable: boolean }

type BridgeTokenItem = GetProviderBuyTokens['tokens'][number]

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

      // Let a failed fetch surface as an SWR error (letting SWR's own retry/backoff run) rather
      // than swallowing it into a synthetic "no route" success value. A synthetic success is
      // indistinguishable from a real, confirmed "unsupported" verdict to `InvalidBridgeOutputUpdater`,
      // which reset the just-picked output/target chain on nothing more than a transient failure of
      // this request (observed as [CS-299]'s output currency and `InvalidBridgeOutputUpdater`
      // resetting the destination — and the sell amount along with it — moments after the picker
      // confirmed the pick). `bridgeRouteData` staying `undefined` on error already falls through
      // `getInvalidBridgeOutputPatch`'s own `!bridgeRouteData` guard as "unresolved, don't reset" —
      // the same behavior `useBridgeSupportedNetworks` (its sibling, feeding the same updater) relies
      // on for its own fetch already.
      const result = await bridgingSdk.getBuyTokens(params)

      const tokens = result.tokens.reduce<TokenWithLogo[]>(
        (acc, token) => collectBridgeToken(acc, token, tokensByAddress),
        [],
      )
      const isRouteAvailable = tokens.length > 0 ? result.isRouteAvailable : false

      return { isRouteAvailable, tokens }
    },
    SWR_NO_REFRESH_OPTIONS,
  )
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

function resolveTokenAddressAndLogo(
  token: BridgeTokenItem,
  tokensByAddress: TokensByAddress,
): { address: string; logoUrl: string | undefined } | null {
  const nativeCurrency = ALL_CHAINS_MAP[token.chainId as TargetChainId].nativeCurrency
  // bridge non-evm native tokens doesn't have address, so we need to map them to our convention address
  const address = token.address || nativeCurrency?.address
  if (!address) return null

  const listToken = tokensByAddress[getAddressKey(address)]
  const logoUrl = listToken?.logoURI || token.logoUrl || nativeCurrency?.logoUrl
  return { address, logoUrl }
}
