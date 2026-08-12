import { reply } from '../mocks/cowProtocolApi'

import type { MockEthFlowTransactionHandle } from './mockEthFlowTransaction'
import type { CowProtocolApiMock } from '../mocks/cowProtocolApi'

export interface MockEthFlowOrderIndexingHandle {
  /** Lets the `order`-by-uid poll start succeeding — what flips the order from `creating` to `pending`/`open`. */
  markIndexed(): void
}

/**
 * Wires the `order` endpoint for an ETH-flow trade. There's no `postOrder` call to hook for this
 * flow (its uid is computed client-side before anything is sent on-chain, see
 * `mockEthFlowTransaction`), so `mockOrderPosting` can't be reused — this is its ETH-flow
 * equivalent. Reports 404 (still `creating`) until `markIndexed()` is called, mirroring
 * `GET /api/v1/orders/{uid}`'s default fixture answering any uid with a valid order. Every
 * amount/status field is read straight off `ethFlow`'s decoded `createOrder()` calldata (and its
 * own `confirmFilled()` flag) rather than trusted from the UI — `classifyOrder`'s
 * `isOrderFulfilled` compares this response's own `sellAmount` against
 * `executedSellAmountBeforeFees`, and an unrelated fixture default would never match.
 */
export function mockEthFlowOrderIndexing(
  cowApi: CowProtocolApiMock,
  ethFlow: MockEthFlowTransactionHandle,
): MockEthFlowOrderIndexingHandle {
  let indexed = false

  cowApi.set('order', (req) => {
    if (!indexed) return reply(404, { errorType: 'NotFound' })

    const orderParams = ethFlow.getOrderParams()
    const defaults = req.defaults as Record<string, unknown>
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
  })

  return {
    markIndexed: () => {
      indexed = true
    },
  }
}
