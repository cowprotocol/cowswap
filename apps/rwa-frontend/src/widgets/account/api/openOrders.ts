import { type EnrichedOrder, OrderKind, OrderStatus, type SupportedChainId } from '@cowprotocol/cow-sdk'

import { collectPages } from '../lib/collectPages'
import { getSupportedChainIds, resolveCounterTokens, settleChains, type TradeLeg, toTradeLeg } from '../lib/tradeLeg'

import type { RwaTokenSummary } from '@/entities/asset'

import { orderBookApi } from '@/shared/api'

const ORDERS_PAGE_SIZE = 1000
const MAX_ORDERS_PAGES = 10
const OPEN_STATUSES: readonly OrderStatus[] = [OrderStatus.OPEN, OrderStatus.PRESIGNATURE_PENDING]

export interface OpenOrder extends TradeLeg {
  uid: string
  status: OrderStatus
  /** 0..1 */
  filledFraction: number
  /** Unix seconds */
  validTo: number
  /** ISO 8601 */
  creationDate: string
}

export interface OpenOrdersQuery {
  owner: string
  /** Only the orders involving these tokens are returned */
  tokens: RwaTokenSummary[]
}

/** Newest first */
export async function getOpenOrders({ owner, tokens }: OpenOrdersQuery): Promise<OpenOrder[]> {
  const orders = await settleChains(getSupportedChainIds(tokens), (chainId) =>
    getChainOpenOrders(chainId, owner, tokens),
  )

  return orders.sort((a, b) => b.creationDate.localeCompare(a.creationDate))
}

async function getChainOpenOrders(
  chainId: SupportedChainId,
  owner: string,
  tokens: RwaTokenSummary[],
): Promise<OpenOrder[]> {
  const openOrders = await collectPages(
    (offset, limit) => orderBookApi.getOrders({ owner, offset, limit }, { chainId }),
    (order) => {
      if (!OPEN_STATUSES.includes(order.status)) return null

      const leg = toTradeLeg(chainId, tokens, order)

      return leg ? { ...leg, ...getOrderDetails(order) } : null
    },
    { pageSize: ORDERS_PAGE_SIZE, maxPages: MAX_ORDERS_PAGES },
  )

  return resolveCounterTokens(chainId, openOrders)
}

function getFilledFraction(order: EnrichedOrder): number {
  const [executed, total] =
    order.kind === OrderKind.SELL
      ? [order.executedSellAmountBeforeFees, order.sellAmount]
      : [order.executedBuyAmount, order.buyAmount]

  const totalAtoms = BigInt(total)

  if (totalAtoms === 0n) return 0

  // Basis points keep the bigint division exact enough for a percentage
  return Number((BigInt(executed) * 10_000n) / totalAtoms) / 10_000
}

function getOrderDetails(order: EnrichedOrder): Omit<OpenOrder, keyof TradeLeg> {
  return {
    uid: order.uid,
    status: order.status,
    filledFraction: getFilledFraction(order),
    validTo: order.validTo,
    creationDate: order.creationDate,
  }
}
