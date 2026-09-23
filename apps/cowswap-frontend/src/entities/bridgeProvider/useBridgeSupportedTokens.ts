import { SWR_NO_REFRESH_OPTIONS, TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { retry, RetryableError, RetryOptions } from '@cowprotocol/common-utils'
import { ALL_CHAINS_MAP, getAddressKey, TargetChainId } from '@cowprotocol/cow-sdk'
import { BuyTokensParams, GetProviderBuyTokens } from '@cowprotocol/sdk-bridging'
import { TokensByAddress, useTokensByAddressMapForChain } from '@cowprotocol/tokens'

import useSWR, { SWRResponse } from 'swr'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { useBridgeProvidersIds } from './useBridgeProvidersIds'

export type BridgeSupportedToken = { tokens: TokenWithLogo[]; isRouteAvailable: boolean }

type BridgeTokenItem = GetProviderBuyTokens['tokens'][number]

// Short and bounded: this backs a "should this destination reset?" decision, not a user-facing
// loading state, so it shouldn't leave the trade form guessing for long.
const GET_BUY_TOKENS_RETRY_OPTIONS: RetryOptions = { n: 2, minWait: 500, maxWait: 1500 }

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

      // A single failed fetch must not read as a confirmed "no route" verdict to
      // `InvalidBridgeOutputUpdater` — that reset the just-picked output/target chain on nothing
      // more than a transient failure here ([CS-299]). Retry it a bounded number of times first;
      // only once those are exhausted do we fall back to "no route", so a route that's genuinely,
      // persistently broken still eventually clears stale cross-chain state instead of leaving it
      // stuck forever.
      let result: GetProviderBuyTokens
      try {
        result = await retry(async () => {
          try {
            return await bridgingSdk.getBuyTokens(params)
          } catch {
            throw new RetryableError()
          }
        }, GET_BUY_TOKENS_RETRY_OPTIONS).promise
      } catch {
        return { isRouteAvailable: false, tokens: [] }
      }

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
