import { OrderStatus } from '@cowprotocol/sdk-order-book'
import type { Order, OrderCreation } from '@cowprotocol/sdk-order-book'

import { randomBytes } from 'node:crypto'

import { reply } from '../cowProtocolApi'

import type { MockEthFlowTransactionHandle } from '../../support/mockEthFlowTransaction'
import type { BalancesMock } from '../balances'
import type { CowProtocolApiMock } from '../cowProtocolApi'

export interface EthFlowOrderTracker {
  /** Lets the `order`-by-uid poll start succeeding — flips the order from `creating` to `pending`/`open`. */
  markIndexed(): void
}

export interface OrdersMock {
  /** Forces the next `postOrder` response to `orderId`, runs `trigger`, and waits for that request to land. */
  expectOrderToBePosted(opts: {
    orderId: OrderUid
    owner: string
    trigger: () => Promise<void>
    /**
     * Overrides the 10s default. Originally a test-only escape hatch to shorten it for the
     * negative-case unit test (`index.test.ts`); also legitimate to lengthen it for a `trigger`
     * that itself needs more than 10s under CI load (e.g. a cross-chain confirm's two separate
     * enable-wait + click pairs) — the race is against `trigger()`'s own completion, not just the
     * network round-trip.
     */
    timeoutMs?: number
  }): Promise<void>
  /** Debits sell / credits buy on `balances`, and flips the order to `fulfilled` (`order`, `orderStatus`). */
  fulfillOrder(
    orderId: OrderUid,
    balances: BalancesMock,
    chainId: number,
    sellTokenBalanceBefore: bigint,
    buyTokenBalanceBefore: bigint,
  ): void
  /** Advances `orderStatus` to the `executing` competition stage, without settling anything. */
  markExecuting(orderId: OrderUid): void
  /** Seeds a fake "open" order directly, without ever posting one through the UI. */
  seedOpenOrder(opts: SeedOpenOrderOpts): void
  /** True once `DELETE /api/v1/orders` (`cancelOrders`) named this uid. */
  wasCancelRequested(orderId: OrderUid): boolean
  /** Marks the order invalidated on the backend — starts the "Cancelling..." → "Cancelled" transition. */
  markCancelled(orderId: OrderUid): void
  /** Wires the `order` endpoint for the eth-flow trade currently in flight (there's no `postOrder` call to hook for that flow, and no client-known uid up front). */
  trackEthFlowOrder(ethFlow: MockEthFlowTransactionHandle): EthFlowOrderTracker
  getOrder(orderId: OrderUid): Order | undefined
  reset(): void
}

export type OrderUid = string

export interface SeedOpenOrderOpts {
  orderId: OrderUid
  owner: string
  sellToken: string
  buyToken: string
  sellAmount: bigint
  buyAmount: bigint
  /** Seconds to backdate `creationDate` by — see `PENDING_ORDERS_BUFFER` note on `markCancelled`. */
  createdSecondsAgo?: number
}

interface RegistryEntry {
  owner: string
  body: OrderCreation | null
  order: Order | null
  stage: Stage
  cancelRequested: boolean
  includeInAccountOrders: boolean
  /** `accountOrders` answers with only this order, dropping the default fixture list — see `seedOpenOrder`. */
  soleAccountOrder: boolean
}

type Stage = 'open' | 'executing' | 'fulfilled'

const DEFAULT_TIMEOUT_MS = 10_000

interface State {
  registry: Map<OrderUid, RegistryEntry>
  ethFlowTracker: { ethFlow: MockEthFlowTransactionHandle; indexed: boolean } | null
}

/** A random, valid-shaped 56-byte order uid, independent of any order body. */
export function generateOrderId(): OrderUid {
  return `0x${randomBytes(56).toString('hex')}`
}

// eslint-disable-next-line max-lines-per-function
export function installOrdersMock(cowApi: CowProtocolApiMock): OrdersMock {
  const state: State = { registry: new Map(), ethFlowTracker: null }

  setupOrderHandlers(state, cowApi)

  return {
    async expectOrderToBePosted({ orderId, owner, trigger, timeoutMs = DEFAULT_TIMEOUT_MS }) {
      let arrived: () => void = () => {}
      const posted = new Promise<void>((resolve) => {
        arrived = resolve
      })

      cowApi.set('postOrder', (req) => {
        const body = req.body as OrderCreation
        state.registry.set(orderId, {
          owner,
          body,
          order: buildOpenOrder(body, orderId, owner),
          stage: 'open',
          cancelRequested: false,
          includeInAccountOrders: true,
          soleAccountOrder: false,
        })
        arrived()
        return orderId
      })

      await withTimeout(
        Promise.all([posted, trigger()]),
        timeoutMs,
        `expectOrderToBePosted: no postOrder request observed for ${orderId} within ${timeoutMs}ms`,
      )
    },

    fulfillOrder(orderId, balances, chainId, sellTokenBalanceBefore, buyTokenBalanceBefore) {
      const entry = state.registry.get(orderId)
      if (!entry?.body || !entry.order) {
        throw new Error(`fulfillOrder: unknown orderId ${orderId} — was it posted or seeded first?`)
      }
      const body = entry.body
      balances.set(entry.owner, chainId, {
        [body.sellToken]: (sellTokenBalanceBefore - BigInt(body.sellAmount)).toString(),
        [body.buyToken]: (buyTokenBalanceBefore + BigInt(body.buyAmount)).toString(),
      })
      entry.order = { ...entry.order, ...buildFulfilledOrderPatch(body) }
      entry.stage = 'fulfilled'
    },

    markExecuting(orderId) {
      const entry = state.registry.get(orderId)
      if (!entry) throw new Error(`markExecuting: unknown orderId ${orderId}`)
      entry.stage = 'executing'
    },

    seedOpenOrder({ orderId, owner, sellToken, buyToken, sellAmount, buyAmount, createdSecondsAgo = 30 }) {
      state.registry.set(orderId, {
        owner,
        body: null,
        order: buildSeededOrder({ orderId, owner, sellToken, buyToken, sellAmount, buyAmount, createdSecondsAgo }),
        stage: 'open',
        cancelRequested: false,
        includeInAccountOrders: true,
        soleAccountOrder: true,
      })
    },

    wasCancelRequested(orderId) {
      const entry = state.registry.get(orderId)
      if (!entry) throw new Error(`wasCancelRequested: unknown orderId ${orderId}`)
      return entry.cancelRequested
    },

    markCancelled(orderId) {
      const entry = state.registry.get(orderId)
      if (!entry?.order) throw new Error(`markCancelled: unknown orderId ${orderId}`)
      entry.order = { ...entry.order, invalidated: true }
    },
    trackEthFlowOrder(ethFlow) {
      state.ethFlowTracker = { ethFlow, indexed: false }
      return {
        markIndexed: () => {
          if (state.ethFlowTracker) state.ethFlowTracker.indexed = true
        },
      }
    },

    getOrder(orderId) {
      return state.registry.get(orderId)?.order ?? undefined
    },

    reset() {
      state.registry.clear()
      state.ethFlowTracker = null
    },
  }
}

/** Every amount/status field is read straight off `ethFlow`'s decoded `createOrder()` calldata (and
 * its own `isFilled()` flag) rather than trusted from the UI. */
function buildEthFlowOrder(ethFlow: MockEthFlowTransactionHandle, defaults: Record<string, unknown>): unknown {
  const orderParams = ethFlow.getOrderParams()
  const filled = ethFlow.isFilled()
  const executedSellAmount = filled ? orderParams?.sellAmount.toString() : '0'
  return {
    ...defaults,
    kind: 'sell',
    buyToken: orderParams?.buyToken,
    sellAmount: orderParams?.sellAmount.toString(),
    buyAmount: orderParams?.buyAmount.toString(),
    status: filled ? 'fulfilled' : 'open',
    executedBuyAmount: filled ? orderParams?.buyAmount.toString() : '0',
    executedSellAmount,
    executedSellAmountBeforeFees: executedSellAmount,
  }
}

/** The subset of fields that change once the order actually settles. */
function buildFulfilledOrderPatch(
  body: OrderCreation,
): Pick<Order, 'status' | 'executedBuyAmount' | 'executedSellAmount' | 'executedSellAmountBeforeFees' | 'executedFee'> {
  return {
    status: OrderStatus.FULFILLED,
    executedBuyAmount: body.buyAmount,
    executedSellAmount: body.sellAmount,
    executedSellAmountBeforeFees: body.sellAmount,
    executedFee: '123000000000',
  }
}

/** The order as the orderbook would report it right after accepting it — not yet settled. */
function buildOpenOrder(body: OrderCreation, uid: string, owner: string): Order {
  return {
    creationDate: new Date().toISOString(),
    owner,
    uid,
    availableBalance: null,
    executedBuyAmount: '0',
    executedSellAmount: '0',
    executedSellAmountBeforeFees: '0',
    executedFeeAmount: '0',
    executedFee: '0',
    executedFeeToken: body.sellToken,
    invalidated: false,
    status: 'open',
    class: 'market',
    settlementContract: '0xf553d092b50bdcbdded1a99af2ca29fbe5e2cb13',
    isLiquidityOrder: false,
    fullAppData: body.appData,
    sellToken: body.sellToken,
    buyToken: body.buyToken,
    receiver: body.receiver,
    sellAmount: body.sellAmount,
    buyAmount: body.buyAmount,
    validTo: body.validTo,
    appData: body.appDataHash,
    feeAmount: body.feeAmount,
    kind: body.kind,
    partiallyFillable: body.partiallyFillable,
    sellTokenBalance: body.sellTokenBalance,
    buyTokenBalance: body.buyTokenBalance,
    signingScheme: body.signingScheme,
    signature: body.signature,
    interactions: { pre: [], post: [] },
  } as Order
}

/** What order-progress polls to learn how a trade is being handled by the competition. */
function buildOrderStatus(type: 'executing' | 'traded', body: OrderCreation): { type: string; value: unknown[] } {
  return {
    type,
    value: [
      {
        solver: '0x99b4136666ca1d13020830350ca8d01a0e5e466b',
        executedAmounts: { sell: body.sellAmount, buy: body.buyAmount },
      },
    ],
  }
}

/** A fake "open" order seeded directly, without ever posting one through the UI. */
function buildSeededOrder(opts: {
  orderId: string
  owner: string
  sellToken: string
  buyToken: string
  sellAmount: bigint
  buyAmount: bigint
  createdSecondsAgo: number
}): Order {
  const { orderId, owner, sellToken, buyToken, sellAmount, buyAmount, createdSecondsAgo } = opts
  return {
    creationDate: new Date(Date.now() - createdSecondsAgo * 1000).toISOString(),
    owner,
    uid: orderId,
    availableBalance: null,
    executedBuyAmount: '0',
    executedSellAmount: '0',
    executedSellAmountBeforeFees: '0',
    executedFeeAmount: '0',
    executedFee: '0',
    executedFeeToken: sellToken,
    invalidated: false,
    status: 'open',
    class: 'market',
    settlementContract: '0xf553d092b50bdcbdded1a99af2ca29fbe5e2cb13',
    isLiquidityOrder: false,
    fullAppData: '{}',
    sellToken,
    buyToken,
    receiver: owner,
    sellAmount: sellAmount.toString(),
    buyAmount: buyAmount.toString(),
    validTo: Math.floor(Date.now() / 1000) + 3600,
    appData: `0x${'cd'.repeat(32)}`,
    feeAmount: '0',
    kind: 'sell',
    partiallyFillable: false,
    sellTokenBalance: 'erc20',
    buyTokenBalance: 'erc20',
    signingScheme: 'eip712',
    signature: `0x${'11'.repeat(65)}`,
    interactions: { pre: [], post: [] },
  } as Order
}

function setupOrderHandlers(state: State, cowApi: CowProtocolApiMock): void {
  cowApi.set('order', (req) => {
    if (state.ethFlowTracker) {
      if (!state.ethFlowTracker.indexed) return reply(404, { errorType: 'NotFound' })
      return buildEthFlowOrder(state.ethFlowTracker.ethFlow, req.defaults as Record<string, unknown>)
    }
    const entry = state.registry.get(req.params.uid)
    return entry?.order ?? req.defaults
  })

  cowApi.set('accountOrders', (req) => {
    const entries = [...state.registry.values()].filter((entry) => entry.includeInAccountOrders && entry.order)
    const mine = entries.map((entry) => entry.order as Order)
    const excludeDefaults = entries.some((entry) => entry.soleAccountOrder)
    return excludeDefaults ? mine : [...mine, ...(req.defaults as unknown[])]
  })

  cowApi.set('orderStatus', (req) => {
    const entry = state.registry.get(req.params.uid)
    if (!entry || entry.stage === 'open' || !entry.body) return req.defaults
    return buildOrderStatus(entry.stage === 'fulfilled' ? 'traded' : 'executing', entry.body)
  })

  cowApi.set('cancelOrders', (req) => {
    const body = req.body as { orderUids?: OrderUid[] } | undefined
    for (const uid of body?.orderUids ?? []) {
      const entry = state.registry.get(uid)
      if (entry) entry.cancelRequested = true
    }
    return req.defaults
  })
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>
}
