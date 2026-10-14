import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useChainId, useConnection } from 'wagmi'

import { networkStatsQueryAtomFamily, tradeQuotesQueryAtomFamily } from './tradeQueryAtoms'
import { tradeChainIdAtom, tradeSideAtom, tradeTokenKeyAtom } from './tradeSelectionAtoms'

import { getAutoToken, getBestQuotedToken, type QuotedToken, toQuotedTokens } from '../lib/quotedTokens'
import { resolveTradeChainId, resolveTradeToken, type TradeToken } from '../lib/tradeToken'

import { assetQueryAtomFamily, type RwaAsset, type RwaQuoteSide, type RwaToken } from '@/entities/asset'

export interface TradeSelection extends TradeToken {
  chainId: number
  side: RwaQuoteSide
  quotedTokens: QuotedToken[]
  bestToken: RwaToken | null
  isQuotesLoading: boolean
  quotesError: Error | null
}

/** `null` when the asset has no tokens */
export function useTradeSelection(asset: RwaAsset): TradeSelection | null {
  const walletChainId = useChainId()
  const { isConnected } = useConnection()
  const side = useAtomValue(tradeSideAtom)
  const selectedTokenKey = useAtomValue(tradeTokenKeyAtom)
  const preferredChainId = useAtomValue(tradeChainIdAtom)
  const stockPrice = useAtomValue(assetQueryAtomFamily(asset.ticker)).data?.market?.price ?? null

  const chainId =
    resolveTradeChainId(asset.tokens, selectedTokenKey, preferredChainId, isConnected ? walletChainId : undefined) ??
    // `validateRegistry` requires tokens, so this only keeps the query atoms keyed
    0
  const networkParams = { ticker: asset.ticker, chainId }
  const quotesQuery = useAtomValue(tradeQuotesQueryAtomFamily(networkParams))
  const { data: stats } = useAtomValue(networkStatsQueryAtomFamily(networkParams))
  // `keepPreviousData` keeps the quotes of the previous side or network while the new ones load
  const chainQuotes = quotesQuery.data?.chainId === chainId ? quotesQuery.data : undefined
  const quotes = chainQuotes?.side === side ? chainQuotes : undefined

  return useMemo(() => {
    const chainTokens = asset.tokens.filter((token) => token.chainId === chainId)
    const quotedTokens = toQuotedTokens(chainTokens, quotes, stats?.chainId === chainId ? stats : undefined, stockPrice)
    const bestToken = getBestQuotedToken(quotedTokens, side)
    const autoToken = getAutoToken(chainTokens, chainQuotes, stockPrice)
    const tradeToken = resolveTradeToken(chainTokens, selectedTokenKey, autoToken?.address ?? null)

    if (!tradeToken) return null

    return {
      ...tradeToken,
      chainId,
      side,
      quotedTokens,
      bestToken,
      isQuotesLoading: !quotes && !quotesQuery.error,
      quotesError: quotes ? null : quotesQuery.error,
    }
  }, [asset.tokens, chainId, chainQuotes, quotes, stats, stockPrice, side, selectedTokenKey, quotesQuery.error])
}
