import type { Address, Hex, WalletClient } from 'viem'

import type { OrderBookApi, OrderCreation, OrderPostingResult } from '@cowprotocol/cow-sdk'
import { SigningScheme } from '@cowprotocol/cow-sdk'

import { signAuthWrapperOrder } from './signAuthWrapperOrder'

import { DEFAULT_BUY_TOKEN_BALANCE, DEFAULT_SELL_TOKEN_BALANCE } from '../authWrapper.constants'

import type { AuthWrapperOrderAuthorization, AuthWrapperOrderToSign, ResolvedAuthWrapper } from '../authWrapper.types'

/**
 * An order posted through a `CowAuthWrapper`.
 *
 * `wrapper` is an extension the orderbook does not model yet: `OrderCreation` has no
 * field for the wrapper authorization, but a solver cannot assemble `wrapperData`
 * (`nestedAppData ‖ orderData ‖ signature ‖ params`) without it. It is sent as an
 * additive property so the order body stays a valid `OrderCreation` for every
 * backend, and is simply ignored by one that does not understand it.
 */
export interface AuthWrappedOrderCreation extends OrderCreation {
  wrapper: AuthWrapperOrderAuthorization
}

/**
 * Shaped as the SDK's `OrderPostingResult` so wrapper and non-wrapper flows are
 * interchangeable downstream, plus the authorization for callers that need it.
 */
export interface AuthWrappedOrderResult extends OrderPostingResult {
  authorization: AuthWrapperOrderAuthorization
}

export interface PostAuthWrappedOrderParams {
  wrapper: ResolvedAuthWrapper
  chainId: number
  account: Address
  order: AuthWrapperOrderToSign
  appData: { fullAppData: string; appDataKeccak256: Hex }
  quoteId?: number | null
  walletClient: WalletClient
  orderBookApi: OrderBookApi
}

/**
 * Builds the order body for a wrapper order.
 *
 * Two things differ from a plain CoW order:
 *
 * - `appData` carries the `orderAppData` envelope hash rather than the hash of the
 *   app-data document. It is sent in the legacy hash form because the two are
 *   deliberately different values here; the document itself is uploaded separately
 *   under its own hash (the `nestedAppData`) so it stays resolvable.
 * - the order is signed under EIP-1271 with the wrapper as verifier, so its
 *   `signature` is just the 20-byte verifier address and its owner (`from`) is the
 *   wrapper — matching `_settlementOrderOwner` and what GPv2 derives from the trade.
 *   The user's own authorization travels in `wrapper.signature` instead.
 */
export function buildAuthWrappedOrderBody(
  order: AuthWrapperOrderToSign,
  authorization: AuthWrapperOrderAuthorization,
  quoteId?: number | null,
): AuthWrappedOrderCreation {
  return {
    sellToken: order.sellToken,
    buyToken: order.buyToken,
    receiver: order.receiver,
    sellAmount: order.sellAmount,
    buyAmount: order.buyAmount,
    validTo: Number(order.validTo),
    feeAmount: order.feeAmount,
    kind: order.kind,
    partiallyFillable: order.partiallyFillable,
    sellTokenBalance: order.sellTokenBalance ?? DEFAULT_SELL_TOKEN_BALANCE,
    buyTokenBalance: order.buyTokenBalance ?? DEFAULT_BUY_TOKEN_BALANCE,
    appData: authorization.orderAppData,
    signingScheme: SigningScheme.EIP1271,
    signature: authorization.address,
    from: authorization.address,
    quoteId: quoteId ?? null,
    wrapper: authorization,
  }
}

/**
 * Signs a CoW order in the wrapper's domain and posts it to the orderbook.
 *
 * Replaces the SDK's `postSwapOrderFromQuote` for wrapper orders: that path derives
 * the order's `appData` field from the app-data document and offers no way to attach
 * the wrapper authorization, both of which a wrapper order needs to change.
 */
export async function postAuthWrappedOrder({
  wrapper,
  chainId,
  account,
  order,
  appData,
  quoteId,
  walletClient,
  orderBookApi,
}: PostAuthWrappedOrderParams): Promise<AuthWrappedOrderResult> {
  const authorization = await signAuthWrapperOrder({
    wrapper,
    chainId,
    account,
    order,
    nestedAppData: appData.appDataKeccak256,
    walletClient,
  })

  // Upload under the nested hash, which is the one the document actually hashes to.
  // The order's `appData` field points at the envelope instead, and the wrapper's
  // `computeOrderAppData` getter is what ties the two together off-chain.
  await orderBookApi.uploadAppData(appData.appDataKeccak256, appData.fullAppData)

  const body = buildAuthWrappedOrderBody(order, authorization, quoteId)
  const orderId = await orderBookApi.sendOrder(body)

  return {
    orderId,
    authorization,
    orderToSign: { ...order, appData: authorization.orderAppData },
    signature: authorization.address,
    signingScheme: SigningScheme.EIP1271,
  }
}
