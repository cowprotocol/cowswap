import type { CowProtocolApiMock } from '../mocks/cowProtocolApi'

const FAKE_ORDER_UID = `0x${'ab'.repeat(56)}`

export interface MockCancellableOrderHandle {
  uid: string
  /** True once `DELETE /api/v1/orders` (`cancelOrders`) has been called for this order. */
  wasCancelRequested(): boolean
  /** Marks the order invalidated on the backend — starts the "Cancelling..." → "Cancelled" transition. */
  markCancelled(): void
}

export interface MockCancellableOrderOpts {
  cowApi: CowProtocolApiMock
  owner: string
  sellToken: string
  buyToken: string
  sellAmount: bigint
  buyAmount: bigint
  /**
   * Seconds to backdate the order's `creationDate` by. `isOrderCancelled` only reports true once
   * `invalidated` has been true for over `PENDING_ORDERS_BUFFER` (60s) since `creationDate` — the
   * default (30s) keeps the transient "Cancelling..." state observable for a while after
   * `markCancelled()` before the order settles into "Cancelled", rather than jumping straight to
   * one or the other.
   */
  createdSecondsAgo?: number
}

/**
 * Seeds a fake "open" order directly through the CoW API mocks, without ever creating one through
 * the swap UI. `#account-activities-list` isn't driven by a live UI action at all:
 * `OrdersFromApiUpdater` polls `GET /api/v1/account/{address}/orders` on its own
 * (`ORDER_BOOK_API_UPDATE_INTERVAL`, 30s) and transforms whatever it returns into local order
 * state — mocking `accountOrders` (and `order`, for the same updater's per-uid reads) is the
 * actual, correct lever, not something that needs reverse-engineering from localStorage.
 *
 * Returning only this fake order from `accountOrders` (not `[fakeOrder, ...req.defaults]`) avoids
 * the default fixture's own orders also being cancellable and ambiguous to locate on the page.
 *
 * Note: `OrdersFromApiUpdater` also needs to resolve `sellToken`/`buyToken` via
 * `useAllActiveTokens()` before it'll turn the fetched order into local state — selecting them via
 * the real dropdown UI (`swapPage.tokens.searchAndPick(...)`, same as most swap tests) is what
 * gets them into that set; this helper only seeds the order data itself.
 */
export function mockCancellableOrder(opts: MockCancellableOrderOpts): MockCancellableOrderHandle {
  const { cowApi, owner, sellToken, buyToken, sellAmount, buyAmount, createdSecondsAgo = 30 } = opts
  const creationDate = new Date(Date.now() - createdSecondsAgo * 1000).toISOString()

  let invalidated = false
  let cancelRequested = false

  const buildOrder = (): unknown => ({
    creationDate,
    owner,
    uid: FAKE_ORDER_UID,
    availableBalance: null,
    executedBuyAmount: '0',
    executedSellAmount: '0',
    executedSellAmountBeforeFees: '0',
    executedFeeAmount: '0',
    executedFee: '0',
    executedFeeToken: sellToken,
    invalidated,
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
  })

  cowApi.set('accountOrders', () => [buildOrder()])
  cowApi.set('order', () => buildOrder())
  cowApi.set('cancelOrders', (req) => {
    cancelRequested = true
    return req.defaults
  })

  return {
    uid: FAKE_ORDER_UID,
    wasCancelRequested: () => cancelRequested,
    markCancelled: () => {
      invalidated = true
    },
  }
}
