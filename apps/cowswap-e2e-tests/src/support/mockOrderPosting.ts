import { Order, OrderStatus, OrderCreation } from '@cowprotocol/sdk-order-book'

import type { BalancesMock } from '../mocks/balances'
import type { CowProtocolApiMock } from '../mocks/cowProtocolApi'

/**
 * Emulates the orderbook accepting whatever order gets posted next: makes `accountOrders`
 * reflect it as `open` right away. Posting alone does **not** settle it — call the returned
 * `fulfill()` whenever the test wants the trade to go through. `fulfill()` then keeps the
 * balances mock in sync with the trade (debits the sell token, credits the buy token), flips
 * the order to `fulfilled` in `accountOrders`, and makes `orderStatus` report it as `traded` —
 * the three things the real backend would eventually reflect once the trade settles on-chain.
 *
 * `markExecuting()` is a lighter-weight intermediate step for tests that also want to observe
 * the order-progress bar's `EXECUTING` stage (solver picked a winner, submitting on-chain) before
 * the trade actually settles — it only advances `orderStatus`, none of the balance/`accountOrders`
 * bookkeeping `fulfill()` does, since nothing has actually executed yet at that stage.
 *
 * Page-agnostic (only wires CoW API mocks) — shared by swap, limit and TWAP order flows.
 *
 * The returned handle also lets a caller read the posted buyAmount/sellAmount back once the
 * order goes through, since the app applies its own slippage on top of the quote — asserting on
 * the resulting balance needs the amount that was actually posted, not the pre-slippage quote
 * (buyAmount varies for a sell order, sellAmount varies for a buy order).
 */
export function mockOrderPosting(
  cowApi: CowProtocolApiMock,
  owner: string,
): {
  getPostedBuyAmount(): string
  getPostedSellAmount(): string
  markExecuting(): void
  fulfill(balances: BalancesMock, chainId: number, sellTokenBalanceBefore: bigint): void
} {
  let postedBody: OrderCreation | null = null
  let postedOrder: Order | null = null

  // Starts out as the plain fixture list; once an order is posted, this starts prepending it —
  // open, then fulfilled once `fulfill()` runs — so "My orders" reflects the order's actual
  // lifecycle without the app ever seeing a real fill on-chain.
  cowApi.set('accountOrders', (req) => {
    const defaults = req.defaults as unknown[]
    return postedOrder ? [postedOrder, ...defaults] : defaults
  })

  cowApi.set('postOrder', (req) => {
    const body = req.body as OrderCreation
    const uid = req.defaults as string
    postedBody = body
    postedOrder = buildOpenOrder(body, uid, owner)
    return req.defaults
  })

  // `PendingOrdersUpdater` classifies pending orders (and decides whether a dismissed
  // progress modal should reopen) off this single-order endpoint rather than `orderStatus` —
  // without it, an order dismissed before `fulfill()` never gets picked back up.
  cowApi.set('order', (req) => postedOrder ?? req.defaults)

  return {
    getPostedBuyAmount: () => postedBody?.buyAmount ?? '',
    getPostedSellAmount: () => postedBody?.sellAmount ?? '',

    markExecuting(): void {
      if (!postedBody) {
        throw new Error('mockOrderPosting: markExecuting() called before an order was posted')
      }

      cowApi.set('orderStatus', () => buildOrderStatus('executing', postedBody as OrderCreation))
    },

    fulfill(balances: BalancesMock, chainId: number, sellTokenBalanceBefore: bigint): void {
      if (!postedBody || !postedOrder) {
        throw new Error('mockOrderPosting: fulfill() called before an order was posted')
      }

      balances.set(owner, chainId, {
        [postedBody.sellToken]: (sellTokenBalanceBefore - BigInt(postedBody.sellAmount)).toString(),
        [postedBody.buyToken]: postedBody.buyAmount,
      })

      postedOrder = { ...postedOrder, ...buildFulfilledOrderPatch(postedBody) }

      // Order-progress polls this once the order exists — "traded" is what moves it past
      // "still searching" to a fulfilled state, mirroring the same fill emulated above.
      cowApi.set('orderStatus', () => buildOrderStatus('traded', postedBody as OrderCreation))
    },
  }
}

/** The subset of `PostedOrder` fields that change once the order actually settles. */
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
