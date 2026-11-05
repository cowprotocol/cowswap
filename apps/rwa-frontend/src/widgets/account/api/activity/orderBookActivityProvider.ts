import type { SupportedChainId, Trade } from '@cowprotocol/cow-sdk'

import { collectPages } from '../../lib/collectPages'
import { getOrderType, type OrderType } from '../../lib/orderType'
import { getSupportedChainIds, resolveCounterTokens, settleChains, toTradeLeg } from '../../lib/tradeLeg'

import type { Activity, ActivityProvider, ActivityQuery } from './types'
import type { RwaTokenSummary } from '@/entities/asset'

import { orderBookApi } from '@/shared/api'
import { getPublicClient } from '@/shared/lib/chain'

const TRADES_PAGE_SIZE = 1000
const MAX_TRADES_PAGES = 10

const blockTimestamps = new Map<string, number>()
const orderTypes = new Map<string, OrderType>()

/** Trades settled by CoW Protocol only: the order book knows nothing about transfers and other protocols */
export const orderBookActivityProvider: ActivityProvider = {
  async getActivity({ owner, tokens, limit }: ActivityQuery): Promise<Activity[]> {
    const activity = await settleChains(getSupportedChainIds(tokens), (chainId) =>
      getChainActivity(chainId, owner, tokens, limit),
    )

    return activity.sort(byTimestampDesc).slice(0, limit)
  },
}

function byTimestampDesc(a: Activity, b: Activity): number {
  return (b.timestamp ?? 0) - (a.timestamp ?? 0)
}

async function getChainActivity(
  chainId: SupportedChainId,
  owner: string,
  tokens: RwaTokenSummary[],
  limit: number,
): Promise<Activity[]> {
  const assetTrades = await collectPages(
    (offset, pageLimit) => orderBookApi.getTrades({ owner, offset, limit: pageLimit }, { chainId }),
    (trade) => {
      const leg = toTradeLeg(chainId, tokens, trade)

      return leg ? { ...leg, trade } : null
    },
    { pageSize: TRADES_PAGE_SIZE, maxPages: MAX_TRADES_PAGES, limit },
  )

  // Trades carry no time nor order type, they come from their blocks and orders
  const [resolved, timestamps, types] = await Promise.all([
    resolveCounterTokens(chainId, assetTrades),
    readBlockTimestamps(
      chainId,
      assetTrades.map(({ trade }) => trade.blockNumber),
    ),
    readOrderTypes(
      chainId,
      assetTrades.map(({ trade }) => trade.orderUid),
    ),
  ])

  return resolved.map(({ trade, ...leg }) => ({
    ...leg,
    ...getTradeDetails(trade),
    orderType: types.get(trade.orderUid) ?? 'swap',
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

/** Block timestamps never change, so each block is read once per session */
async function readBlockTimestamps(chainId: number, blockNumbers: number[]): Promise<Map<number, number>> {
  const client = getPublicClient(chainId)
  const timestamps = new Map<number, number>()

  await Promise.all(
    [...new Set(blockNumbers)].map(async (blockNumber) => {
      const key = `${chainId}:${blockNumber}`
      const cached = blockTimestamps.get(key)

      if (cached !== undefined) {
        timestamps.set(blockNumber, cached)
        return
      }

      const block = await client?.getBlock({ blockNumber: BigInt(blockNumber) }).catch(() => null)

      if (!block) return

      blockTimestamps.set(key, Number(block.timestamp))
      timestamps.set(blockNumber, Number(block.timestamp))
    }),
  )

  return timestamps
}

/** An order type never changes, so each order is read once per session */
async function readOrderTypes(chainId: SupportedChainId, orderUids: string[]): Promise<Map<string, OrderType>> {
  const types = new Map<string, OrderType>()

  await Promise.all(
    [...new Set(orderUids)].map(async (orderUid) => {
      const key = `${chainId}:${orderUid}`
      const cached = orderTypes.get(key)

      if (cached !== undefined) {
        types.set(orderUid, cached)
        return
      }

      const order = await orderBookApi.getOrder(orderUid, { chainId }).catch(() => null)

      if (!order) return

      const type = getOrderType(order)

      orderTypes.set(key, type)
      types.set(orderUid, type)
    }),
  )

  return types
}
