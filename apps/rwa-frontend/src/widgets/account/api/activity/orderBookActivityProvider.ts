import { type EnrichedOrder, isSupportedChain, type SupportedChainId, type Trade } from '@cowprotocol/cow-sdk'
import type { TwapOrder } from '@cowprotocol/sdk-composable'

import { collectPages } from '../../lib/collectPages'
import { getOrderType } from '../../lib/orderType'
import { getSupportedChainIds, resolveCounterTokens, settleChains, toTradeLeg } from '../../lib/tradeLeg'
import { findTwapPart } from '../../lib/twapPart'
import { collectTwapOrders } from '../twapOrders'

import type { Activity, ActivityProvider, ActivityQuery } from './types'
import type { RwaTokenSummary } from '@/entities/asset'

import { orderBookApi, programmaticOrderApi } from '@/shared/api'
import { getPublicClient } from '@/shared/lib/chain'

const TRADES_PAGE_SIZE = 1000
const MAX_TRADES_PAGES = 10
const COW_SHEDS_PAGE_SIZE = 1000

const blockTimestamps = new Map<string, number>()
const orderInfos = new Map<string, OrderInfo>()

type OrderInfo = Pick<Activity, 'orderType' | 'twapPart'>
type TradeActivity = Omit<Activity, keyof OrderInfo>

const UNKNOWN_ORDER_INFO: OrderInfo = { orderType: 'swap', twapPart: null }

/** Trades settled by CoW Protocol only: the order book knows nothing about transfers and other protocols */
export const orderBookActivityProvider: ActivityProvider = {
  async getActivity({ owner, tokens, limit }: ActivityQuery): Promise<Activity[]> {
    const activity = await settleChains(getSupportedChainIds(tokens), (chainId) =>
      getChainActivity(chainId, owner, tokens, limit),
    )

    const latest = activity.sort(byTimestampDesc).slice(0, limit)
    const infos = await readOrderInfos(owner, latest)

    return latest.map((item) => ({ ...item, ...(infos.get(getOrderKey(item)) ?? UNKNOWN_ORDER_INFO) }))
  },
}

function byTimestampDesc(a: TradeActivity, b: TradeActivity): number {
  return (b.timestamp ?? 0) - (a.timestamp ?? 0)
}

async function getChainActivity(
  chainId: SupportedChainId,
  owner: string,
  tokens: RwaTokenSummary[],
  limit: number,
): Promise<TradeActivity[]> {
  const traders = await getTraders(chainId, owner)
  const traderTrades = await Promise.all(
    traders.map((trader) =>
      collectPages(
        (offset, pageLimit) => orderBookApi.getTrades({ owner: trader, offset, limit: pageLimit }, { chainId }),
        (trade) => {
          const leg = toTradeLeg(chainId, tokens, trade)

          return leg ? { ...leg, trade } : null
        },
        { pageSize: TRADES_PAGE_SIZE, maxPages: MAX_TRADES_PAGES, limit },
      ),
    ),
  )
  const assetTrades = traderTrades.flat()

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

function getOrderInfo(order: EnrichedOrder, twaps: TwapOrder[] | undefined): OrderInfo {
  const orderType = getOrderType(order)

  return { orderType, twapPart: orderType === 'twap' && twaps ? findTwapPart(order, twaps) : null }
}

function getOrderKey({ chainId, orderUid }: Pick<TradeActivity, 'chainId' | 'orderUid'>): string {
  return `${chainId}:${orderUid}`
}

function getTradeDetails(trade: Trade): Pick<TradeActivity, 'id' | 'kind' | 'txHash' | 'orderUid'> {
  return {
    id: `${trade.orderUid}:${trade.blockNumber}:${trade.logIndex}`,
    kind: 'trade',
    txHash: trade.txHash,
    orderUid: trade.orderUid,
  }
}

/** The wallet and its CoW Shed proxies, which own the parts of the TWAPs placed by an EOA */
async function getTraders(chainId: SupportedChainId, owner: string): Promise<string[]> {
  const cowSheds = await programmaticOrderApi
    .getDeployedCowSheds({ owner, chainId }, { limit: COW_SHEDS_PAGE_SIZE })
    .then(({ items }) => items.map(({ address }) => address))
    .catch((): string[] => [])

  return [owner, ...cowSheds]
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

/** An order never changes, so each order is read once per session, a TWAP part once its TWAP is found */
async function readOrderInfos(owner: string, items: TradeActivity[]): Promise<Map<string, OrderInfo>> {
  const infos = new Map<string, OrderInfo>()
  const missing = new Map<string, { chainId: SupportedChainId; orderUid: string }>()

  for (const { chainId, orderUid } of items) {
    if (!orderUid || !isSupportedChain(chainId)) continue

    const key = getOrderKey({ chainId, orderUid })
    const cached = orderInfos.get(key)

    if (cached) infos.set(key, cached)
    else missing.set(key, { chainId, orderUid })
  }

  const orders = (
    await Promise.all(
      [...missing].map(async ([key, { chainId, orderUid }]) => {
        const order = await orderBookApi.getOrder(orderUid, { chainId }).catch(() => null)

        return order ? [{ key, chainId, order }] : []
      }),
    )
  ).flat()

  const twapChainIds = [
    ...new Set(orders.filter(({ order }) => getOrderType(order) === 'twap').map(({ chainId }) => chainId)),
  ]
  const twaps = await readTwaps(twapChainIds, owner)

  for (const { key, chainId, order } of orders) {
    const info = getOrderInfo(order, twaps.get(chainId))

    if (info.orderType !== 'twap' || info.twapPart) orderInfos.set(key, info)

    infos.set(key, info)
  }

  return infos
}

async function readTwaps(chainIds: SupportedChainId[], owner: string): Promise<Map<SupportedChainId, TwapOrder[]>> {
  const twaps = await Promise.all(
    chainIds.map(async (chainId) => {
      const chainTwaps = await collectTwapOrders(chainId, owner, (twap) => twap).catch(() => null)

      return chainTwaps ? [[chainId, chainTwaps] as const] : []
    }),
  )

  return new Map(twaps.flat())
}
