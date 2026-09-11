import { isSolanaChain, OrderClass, OrderKind, OrderStatus, SigningScheme } from '@cowprotocol/cow-sdk'

import { Network } from 'types'

import { RawOrder, RawTrade } from 'api/operator/types'

import { SolanaOrderKind, SolanaOrderStatus, SolanaRawOrder, SolanaRawTrade } from './types'

/**
 * Solana order-book payloads expressed as the EVM ones, so the shared order helpers and UI work
 * unchanged. What has no EVM counterpart travels on `order.solana` rather than being dropped.
 */

/**
 * Response mapper for a chain, identity on EVM. The Solana book mirrors the EVM paths, so the SDK
 * reaches it unchanged and types its reply as an EVM order without it being one.
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

/** Spelled identically on both sides; mapped rather than cast so a new state breaks the build. */
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
    // Nothing charges a fee on Solana today; revisit when that changes, `isOrderFilled` subtracts
    // `executedFeeAmount` and only a zero makes it match the book's own fill check.
    feeAmount: '0',
    executedFeeAmount: '0',
    totalFee: '0',
    executedSellAmountBeforeFees: executedSellAmount,
    invalidated: status === 'cancelled',
    // Authorised on-chain by `CreateOrder`, which is what presign means on EVM.
    signingScheme: SigningScheme.PRESIGN,
    // Not carried by these endpoints.
    signature: '',
    settlementContract: '',
    // No order classes on Solana yet; limit orders would make this a real value.
    class: OrderClass.MARKET,
    // No EVM counterpart. Its presence is also what marks the order as Solana's.
    solana: { orderPda, sellTokenAccount, buyTokenAccount },
  }
}

/**
 * `blockNumber` carries a slot, which means nothing to an EVM RPC — never pass it to
 * `web3.eth.getBlock`. `0` stands in for a settlement that is not indexed yet.
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
    // No fee charged, so this is already the before-fees amount.
    sellAmountBeforeFees: sellAmount,
    // Base58 signature, not a 0x hash.
    txHash: txSignature,
    logIndex: instructionIndex,
    blockNumber: slot ?? 0,
  }
}
