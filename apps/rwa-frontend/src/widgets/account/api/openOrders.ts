import {
  areAddressesEqual,
  type EnrichedOrder,
  OrderKind,
  OrderStatus,
  SigningScheme,
  type SupportedChainId,
} from '@cowprotocol/cow-sdk'
import type { TwapOrder } from '@cowprotocol/sdk-composable'

import { collectTwapOrders } from './twapOrders'

import { collectPages } from '../lib/collectPages'
import { getOrderType, type OrderType } from '../lib/orderType'
import { getSupportedChainIds, resolveCounterTokens, settleChains, type TradeLeg, toTradeLeg } from '../lib/tradeLeg'

import type { CowShedTwap } from './cancelCowShedTwap'
import type { TwapSchedule } from '../lib/twapProgress'
import type { RwaTokenSummary } from '@/entities/asset'

import { orderBookApi } from '@/shared/api'

const ORDERS_PAGE_SIZE = 1000
const MAX_ORDERS_PAGES = 10
const OPEN_STATUSES: readonly OrderStatus[] = [OrderStatus.OPEN, OrderStatus.PRESIGNATURE_PENDING]
const OFF_CHAIN_SIGNING_SCHEMES: readonly SigningScheme[] = [SigningScheme.EIP712, SigningScheme.ETHSIGN]

export interface OpenOrder extends TradeLeg {
  /** Order UID, or the creation event ID for a TWAP */
  uid: string
  status: OrderStatus
  /** 0..1 */
  filledFraction: number
  /** Unix seconds */
  validTo: number
  /** ISO 8601 */
  creationDate: string
  /** Can be cancelled with a signed message, otherwise only with a transaction */
  isSoftCancellable: boolean
  type: OrderType
  /** Set for a TWAP placed by an EOA, which is cancelled through its CoW Shed */
  cowShedTwap?: CowShedTwap
  /** Set for a TWAP */
  twapSchedule?: TwapSchedule
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

function getBookOpenOrders(chainId: SupportedChainId, owner: string, tokens: RwaTokenSummary[]): Promise<OpenOrder[]> {
  return collectPages(
    (offset, limit) => orderBookApi.getOrders({ owner, offset, limit }, { chainId }),
    (order) => {
      if (!OPEN_STATUSES.includes(order.status)) return null

      const leg = toTradeLeg(chainId, tokens, order)

      return leg ? { ...leg, ...getOrderDetails(order) } : null
    },
    { pageSize: ORDERS_PAGE_SIZE, maxPages: MAX_ORDERS_PAGES },
  )
}

async function getChainOpenOrders(
  chainId: SupportedChainId,
  owner: string,
  tokens: RwaTokenSummary[],
): Promise<OpenOrder[]> {
  const [bookOrders, twapOrders] = await Promise.all([
    getBookOpenOrders(chainId, owner, tokens),
    getTwapOpenOrders(chainId, owner, tokens).catch(() => null),
  ])
  // A TWAP shows as one row instead of its parts, unless the TWAPs couldn't be loaded
  const openOrders = twapOrders ? [...bookOrders.filter((order) => order.type !== 'twap'), ...twapOrders] : bookOrders

  return resolveCounterTokens(chainId, openOrders)
}

function getFilledFraction(order: EnrichedOrder): number {
  const [executed, total] =
    order.kind === OrderKind.SELL
      ? [order.executedSellAmountBeforeFees, order.sellAmount]
      : [order.executedBuyAmount, order.buyAmount]

  return toFraction(BigInt(executed), BigInt(total))
}

function getOrderDetails(order: EnrichedOrder): Omit<OpenOrder, keyof TradeLeg> {
  return {
    uid: order.uid,
    status: order.status,
    filledFraction: getFilledFraction(order),
    validTo: order.validTo,
    creationDate: order.creationDate,
    // ETH-flow orders are owned by the ETH-flow contract, which can't sign a cancellation
    isSoftCancellable: !order.onchainOrderData && OFF_CHAIN_SIGNING_SCHEMES.includes(order.signingScheme),
    type: getOrderType(order),
  }
}

function getTwapDetails({
  eventId,
  hash,
  owner,
  resolvedOwner,
  schedule,
  executedAmounts,
  createdAt,
}: TwapOrder): Omit<OpenOrder, keyof TradeLeg> {
  const { partSellAmount, numberOfParts, effectiveStartTime, timeBetweenParts } = schedule

  return {
    uid: eventId,
    status: OrderStatus.OPEN,
    filledFraction: toFraction(executedAmounts.executedSellAmount, partSellAmount * BigInt(numberOfParts)),
    validTo: effectiveStartTime + timeBetweenParts * numberOfParts,
    creationDate: new Date(createdAt * 1000).toISOString(),
    isSoftCancellable: false,
    type: 'twap',
    // A Safe owns its TWAPs, an EOA's are owned by its CoW Shed
    cowShedTwap: areAddressesEqual(owner, resolvedOwner) ? undefined : { eventId, hash, cowShedAddress: owner },
    twapSchedule: { startTime: effectiveStartTime, interval: timeBetweenParts, partsCount: numberOfParts },
  }
}

/** TWAPs placed by an EOA are owned by its CoW Shed proxy, so the order book can't find them by the EOA */
function getTwapOpenOrders(chainId: SupportedChainId, owner: string, tokens: RwaTokenSummary[]): Promise<OpenOrder[]> {
  return collectTwapOrders(chainId, owner, (twap) => {
    if (twap.status !== 'open') return null

    const { sellToken, buyToken, partSellAmount, minPartLimit } = twap.schedule
    const leg = toTradeLeg(chainId, tokens, {
      sellToken,
      sellAmount: partSellAmount.toString(),
      buyToken,
      buyAmount: minPartLimit.toString(),
    })

    return leg ? { ...leg, ...getTwapDetails(twap) } : null
  })
}

function toFraction(executed: bigint, total: bigint): number {
  if (total === 0n) return 0

  // Basis points keep the bigint division exact enough for a percentage
  return Number((executed * 10_000n) / total) / 10_000
}
