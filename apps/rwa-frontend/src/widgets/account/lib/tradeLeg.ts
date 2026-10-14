import { normalizeError } from '@cowprotocol/common-utils/errors'
import { areAddressesEqual, getAddressKey, isSupportedChain, type SupportedChainId } from '@cowprotocol/cow-sdk'

import type { RwaToken } from '@/entities/asset'

import { readTokensMetadata, type TokenMetadata, type TokensMetadataMap } from '@/shared/api'

export interface SwapAmounts {
  sellToken: string
  sellAmount: string
  buyToken: string
  buyAmount: string
}

/** A swap seen from the asset's side: buying or selling one of its tokens for a counter token */
export interface TradeLeg {
  chainId: number
  side: TradeSide
  assetToken: RwaToken
  /** Atoms of `assetToken`, decimal string */
  assetAmount: string
  counterTokenAddress: string
  /** `null` when the token metadata couldn't be read */
  counterToken: TokenMetadata | null
  /** Atoms of the counter token, decimal string */
  counterAmount: string
}

export type TradeSide = 'buy' | 'sell'

export function findAssetToken(tokens: RwaToken[], chainId: number, address: string): RwaToken | undefined {
  return tokens.find((token) => token.chainId === chainId && areAddressesEqual(token.address, address))
}

export function getSupportedChainIds(tokens: RwaToken[]): SupportedChainId[] {
  return [...new Set(tokens.map((token) => token.chainId))].filter(isSupportedChain)
}

/** Legs whose counter token metadata can't be read keep `counterToken: null` */
export async function resolveCounterTokens<T extends TradeLeg>(chainId: number, legs: T[]): Promise<T[]> {
  if (!legs.length) return legs

  const metadata = await readTokensMetadata(
    chainId,
    legs.map((leg) => leg.counterTokenAddress),
  ).catch((): TokensMetadataMap => ({}))

  return legs.map((leg) => ({ ...leg, counterToken: metadata[getAddressKey(leg.counterTokenAddress)] ?? null }))
}

/** Resolves with the chains that succeeded, rejects only when all of them failed */
export async function settleChains<T>(
  chainIds: SupportedChainId[],
  load: (chainId: SupportedChainId) => Promise<T[]>,
): Promise<T[]> {
  const results = await Promise.allSettled(chainIds.map(load))
  const fulfilled = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
  const rejected = results.find((result) => result.status === 'rejected')

  if (!fulfilled.length && rejected) throw normalizeError(rejected.reason)

  return fulfilled.flat()
}

/** Returns `null` when neither side of the swap is one of `tokens`, see `resolveCounterTokens` for `counterToken` */
export function toTradeLeg(chainId: number, tokens: RwaToken[], swap: SwapAmounts): TradeLeg | null {
  const boughtAssetToken = findAssetToken(tokens, chainId, swap.buyToken)

  if (boughtAssetToken) {
    return {
      chainId,
      side: 'buy',
      assetToken: boughtAssetToken,
      assetAmount: swap.buyAmount,
      counterTokenAddress: swap.sellToken,
      counterToken: null,
      counterAmount: swap.sellAmount,
    }
  }

  const soldAssetToken = findAssetToken(tokens, chainId, swap.sellToken)

  if (soldAssetToken) {
    return {
      chainId,
      side: 'sell',
      assetToken: soldAssetToken,
      assetAmount: swap.sellAmount,
      counterTokenAddress: swap.buyToken,
      counterToken: null,
      counterAmount: swap.buyAmount,
    }
  }

  return null
}
