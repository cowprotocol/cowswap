import type { SupportedChainId, Trade } from '@cowprotocol/cow-sdk'

import { getSupportedChainIds, resolveCounterTokens, settleChains, toTradeLeg } from '../../lib/tradeLeg'

import type { Activity, ActivityProvider, ActivityQuery } from './types'
import type { RwaToken } from '@/entities/asset'

import { orderBookApi } from '@/shared/api'
import { getPublicClient } from '@/shared/lib/chain'

const TRADES_PAGE_SIZE = 100

/** Trades settled by CoW Protocol only: the order book knows nothing about transfers and other protocols */
export const orderBookActivityProvider: ActivityProvider = {
  async getActivity({ owner, tokens, limit }: ActivityQuery): Promise<Activity[]> {
    const activity = await settleChains(getSupportedChainIds(tokens), (chainId) =>
      getChainActivity(chainId, owner, tokens),
    )

    return activity.sort(byTimestampDesc).slice(0, limit)
  },
}

function byTimestampDesc(a: Activity, b: Activity): number {
  return (b.timestamp ?? 0) - (a.timestamp ?? 0)
}

async function getChainActivity(chainId: SupportedChainId, owner: string, tokens: RwaToken[]): Promise<Activity[]> {
  const trades = await orderBookApi.getTrades({ owner, limit: TRADES_PAGE_SIZE }, { chainId })
  const assetTrades = trades.flatMap((trade) => {
    const leg = toTradeLeg(chainId, tokens, trade)

    return leg ? [{ ...leg, trade }] : []
  })

  // Trades carry no time, it comes from their blocks
  const [resolved, timestamps] = await Promise.all([
    resolveCounterTokens(chainId, assetTrades),
    readBlockTimestamps(
      chainId,
      assetTrades.map(({ trade }) => trade.blockNumber),
    ),
  ])

  return resolved.map(({ trade, ...leg }) => ({
    ...leg,
    ...getTradeDetails(trade),
    timestamp: timestamps.get(trade.blockNumber) ?? null,
  }))
}

function getTradeDetails(trade: Trade): Pick<Activity, 'id' | 'kind' | 'txHash' | 'orderUid'> {
  return {
    id: `${trade.orderUid}:${trade.blockNumber}:${trade.logIndex}`,
    kind: 'trade',
    txHash: trade.txHash,
    orderUid: trade.orderUid,
  }
}

async function readBlockTimestamps(chainId: number, blockNumbers: number[]): Promise<Map<number, number>> {
  const client = getPublicClient(chainId)
  const timestamps = new Map<number, number>()

  if (!client) return timestamps

  await Promise.all(
    [...new Set(blockNumbers)].map(async (blockNumber) => {
      const block = await client.getBlock({ blockNumber: BigInt(blockNumber) }).catch(() => null)

      if (block) timestamps.set(blockNumber, Number(block.timestamp))
    }),
  )

  return timestamps
}
