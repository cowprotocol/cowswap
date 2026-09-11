import { isSolanaChain, OrderClass, OrderKind, OrderStatus, SigningScheme } from '@cowprotocol/cow-sdk'

import { Network } from 'types'

import { RawOrder, RawTrade } from 'api/operator/types'

import { SolanaOrderKind, SolanaOrderStatus, SolanaRawOrder, SolanaRawTrade } from './types'

/**
 * Solana order-book payloads expressed as the EVM ones the explorer already consumes.
 *
 * The two books describe the same thing — an intent and its fills — with different field names, and
 * the arithmetic over them (filled amount, surplus, limit price) is identical. Renaming the fields
 * once, here, keeps that arithmetic in a single tested implementation instead of forking
 * `transformOrder`, `transformTrade` and every helper they call.
 *
 * Normalising is not flattening: what Solana has and EVM does not travels on `order.solana` rather
 * than being dropped, so components are free to diverge on top of one data layer. Every EVM-only
 * field is filled with the value that makes the shared helpers reach the same conclusion the book
 * reached server-side; fields genuinely unknowable from these endpoints are left empty rather than
 * invented, and the UI has to stop showing them for Solana.
 */

/**
 * The response mapper for a chain, identity on EVM.
 *
 * The Solana order book mirrors the EVM paths — `/api/v1/orders/{uid}`,
 * `/api/v1/account/{owner}/orders`, `/api/v2/trades` — so `OrderBookApi` reaches it unchanged once
 * its context carries the Solana chain id, and what it hands back is typed as an EVM order without
 * being one. Mapping at that boundary keeps the callers above it chain-agnostic.
 */
export function orderNormalizer(networkId: Network): (order: RawOrder) => RawOrder {
  if (!isSolanaChain(networkId)) return (order) => order

  return (order) => toRawOrder(order as unknown as SolanaRawOrder)
}

/** @see {@link orderNormalizer} */
export function tradesNormalizer(networkId: Network): (trades: RawTrade[]) => RawTrade[] {
  if (!isSolanaChain(networkId)) return (trades) => trades

  return (trades) => trades.map((trade) => toRawTrade(trade as unknown as SolanaRawTrade))
}

const ORDER_KIND: Record<SolanaOrderKind, OrderKind> = {
  sell: OrderKind.SELL,
  buy: OrderKind.BUY,
}

/**
 * Solana's statuses are a subset of the EVM ones, spelled identically. Mapping them rather than
 * asserting the overlap means the compiler catches it if either side ever adds a state.
 */
const ORDER_STATUS: Record<SolanaOrderStatus, OrderStatus> = {
  open: OrderStatus.OPEN,
  fulfilled: OrderStatus.FULFILLED,
  cancelled: OrderStatus.CANCELLED,
  expired: OrderStatus.EXPIRED,
}

export function toRawOrder(order: SolanaRawOrder): RawOrder {
  const {
    uid,
    owner,
    sellToken,
    buyToken,
    sellTokenAccount,
    buyTokenAccount,
    orderPda,
    sellAmount,
    buyAmount,
    validTo,
    kind,
    partiallyFillable,
    appData,
    creationDate,
    executedSellAmount,
    executedBuyAmount,
    status,
  } = order

  return {
    uid,
    owner,
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    validTo,
    kind: ORDER_KIND[kind],
    partiallyFillable,
    appData,
    creationDate,
    executedSellAmount,
    executedBuyAmount,
    status: ORDER_STATUS[status],
    receiver: buyTokenAccount,
    // Currently no component in the Solana flow charges a fee (`openapi.yml`: "Always zero. No
    // component charges a fee"), so every fee field is zero rather than unknown. This has to be
    // revisited once fees exist: `isOrderFilled` subtracts `executedFeeAmount` from the executed
    // sell amount, and only while it is zero does that reduce to the book's own
    // `amount_withdrawn >= sell_amount`.
    feeAmount: '0',
    executedFeeAmount: '0',
    totalFee: '0',
    executedSellAmountBeforeFees: executedSellAmount,
    invalidated: status === 'cancelled',
    // The order exists because a `CreateOrder` instruction was signed and landed on-chain, which
    // is what presign means on EVM: authorisation recorded on-chain rather than a signature
    // carried with the order. The Solana trading SDK reports the same scheme when it builds one.
    signingScheme: SigningScheme.PRESIGN,
    // Not carried by these endpoints: the authorising transaction is not part of the order
    // payload, and the settlement program's address is deployment configuration, not order data.
    signature: '',
    settlementContract: '',
    // Solana currently has no order classes; every order is a plain swap. Limit orders would
    // need this to stop being a constant.
    class: OrderClass.MARKET,
    // Everything above is the intent as the EVM book would describe it. These have no EVM
    // counterpart, so they travel separately rather than being dropped — and their presence is
    // what tells a component it is looking at a Solana order.
    solana: { orderPda, sellTokenAccount, buyTokenAccount },
  }
}

/**
 * `slot` is not a block number — it indexes Solana's slot clock and means nothing to an EVM RPC.
 * It is mapped onto `blockNumber` so the shared trade code can carry it, and callers must not
 * feed it to `web3.eth.getBlock`. It is `null` until the settlement row is indexed; `0` stands in
 * for that, matching how `blockNumber` is treated as "not yet known" elsewhere.
 */
export function toRawTrade(trade: SolanaRawTrade): RawTrade {
  const { orderUid, owner, sellToken, buyToken, sellAmount, buyAmount, txSignature, instructionIndex, slot } = trade

  return {
    orderUid,
    owner,
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    // Currently no fee is charged, so the fill's sell amount is already its before-fees amount.
    sellAmountBeforeFees: sellAmount,
    // A base58 transaction signature, not a 0x hash. Anything linking it out has to point at a
    // Solana explorer.
    txHash: txSignature,
    logIndex: instructionIndex,
    blockNumber: slot ?? 0,
  }
}
