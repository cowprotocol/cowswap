import { OrderClass, OrderKind, OrderStatus as RawOrderStatus, SigningScheme } from '@cowprotocol/cow-sdk'

import { transformOrder } from 'utils'

import { OrderStatus } from 'api/operator'
import { toRawOrder, toRawTrade } from 'api/solanaOrderbook'
import { SolanaRawOrder, SolanaRawTrade } from 'api/solanaOrderbook/types'

/** A real `GET /api/v1/orders/{uid}` response from `barn.api.cow.fi/solana`, unedited. */
const SOLANA_ORDER: SolanaRawOrder = {
  uid: '0xd2a46fcaa12798182177bc97ab8d413bd6a2b341c6f848741f86aac3e6ae15f0',
  owner: '2c1E71jPXqgM8nJXiQpCEwGhXSVA8GTN4a1qTS1ibyLa',
  sellToken: 'So11111111111111111111111111111111111111112',
  buyToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  sellTokenAccount: 'G5F2C2cdSnnx63Bf48xjJBxKfQqV2XKMwWo3JyuC4kWt',
  buyTokenAccount: 'HGTu6fBshWXJQe59C31RgyGcfhEusg1Y65Upcmd9zvCM',
  sellAmount: '200000000',
  buyAmount: '19966041',
  validTo: 1789067192,
  kind: 'sell',
  partiallyFillable: false,
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
  orderPda: 'Aim7u7pMEFGFCEJNk9L3VgeTfwKVwuTPTCphAwTA9hzH',
  creationDate: '2026-09-10T19:04:55.119331Z',
  executedSellAmount: '0',
  executedBuyAmount: '0',
  status: 'expired',
}

/** A real `GET /api/v2/trades?orderUid=…` entry, unedited. */
const SOLANA_TRADE: SolanaRawTrade = {
  orderUid: '0x7dcc25777cc80edcf5dcbb2d3a78df351a2e61eee9cf0373727a11452f26917f',
  owner: '2c1E71jPXqgM8nJXiQpCEwGhXSVA8GTN4a1qTS1ibyLa',
  sellToken: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  buyToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  sellAmount: '21031165',
  buyAmount: '21032050',
  txSignature: '4UFoT7qLyRLezurQpgZB3qW3LEBcU2JYfEgb6hkpaU3cd2KgxY5q8SA1sJAGagFoVbvq3ySJSVjCNUA1U9i6jPc9',
  instructionIndex: 0,
  slot: 444862995,
}

describe('toRawOrder', () => {
  it('carries the order over unchanged where the two books agree', () => {
    const order = toRawOrder(SOLANA_ORDER)

    expect(order.uid).toBe(SOLANA_ORDER.uid)
    expect(order.owner).toBe(SOLANA_ORDER.owner)
    expect(order.sellToken).toBe(SOLANA_ORDER.sellToken)
    expect(order.buyToken).toBe(SOLANA_ORDER.buyToken)
    expect(order.sellAmount).toBe(SOLANA_ORDER.sellAmount)
    expect(order.buyAmount).toBe(SOLANA_ORDER.buyAmount)
    expect(order.validTo).toBe(SOLANA_ORDER.validTo)
    expect(order.appData).toBe(SOLANA_ORDER.appData)
    expect(order.creationDate).toBe(SOLANA_ORDER.creationDate)
    expect(order.partiallyFillable).toBe(false)
  })

  it('maps the string kind and status onto the shared enums', () => {
    expect(toRawOrder(SOLANA_ORDER).kind).toBe(OrderKind.SELL)
    expect(toRawOrder(SOLANA_ORDER).status).toBe(RawOrderStatus.EXPIRED)
    expect(toRawOrder({ ...SOLANA_ORDER, kind: 'buy' }).kind).toBe(OrderKind.BUY)
    expect(toRawOrder({ ...SOLANA_ORDER, status: 'fulfilled' }).status).toBe(RawOrderStatus.FULFILLED)
  })

  it('uses the buy token account as the receiver', () => {
    expect(toRawOrder(SOLANA_ORDER).receiver).toBe(SOLANA_ORDER.buyTokenAccount)
  })

  it('carries the fields that have no EVM counterpart instead of dropping them', () => {
    expect(toRawOrder(SOLANA_ORDER).solana).toEqual({
      orderPda: SOLANA_ORDER.orderPda,
      sellTokenAccount: SOLANA_ORDER.sellTokenAccount,
      buyTokenAccount: SOLANA_ORDER.buyTokenAccount,
    })
  })

  it('survives transformOrder, so components can still tell the order is Solana', () => {
    expect(transformOrder(toRawOrder(SOLANA_ORDER)).solana?.orderPda).toBe(SOLANA_ORDER.orderPda)
  })

  it('zeroes every fee, because no component in the Solana flow charges one', () => {
    const order = toRawOrder(SOLANA_ORDER)

    expect(order.feeAmount).toBe('0')
    expect(order.executedFeeAmount).toBe('0')
    expect(order.totalFee).toBe('0')
  })

  it('reports the executed sell amount as its own before-fees amount', () => {
    const order = toRawOrder({ ...SOLANA_ORDER, executedSellAmount: '12345' })

    expect(order.executedSellAmount).toBe('12345')
    expect(order.executedSellAmountBeforeFees).toBe('12345')
  })

  it('marks only a cancelled order as invalidated', () => {
    expect(toRawOrder(SOLANA_ORDER).invalidated).toBe(false)
    expect(toRawOrder({ ...SOLANA_ORDER, status: 'cancelled' }).invalidated).toBe(true)
  })

  it('describes the order as an on-chain authorised market swap', () => {
    const order = toRawOrder(SOLANA_ORDER)

    expect(order.signingScheme).toBe(SigningScheme.PRESIGN)
    expect(order.class).toBe(OrderClass.MARKET)
  })
})

/**
 * The point of normalising rather than forking the pipeline: the explorer derives an order's state
 * itself instead of trusting the `status` field, so the derivation has to land on what the Solana
 * book already decided server-side.
 */
describe('toRawOrder feeding transformOrder', () => {
  it('derives Filled when the sell side is fully withdrawn', () => {
    const filled = toRawOrder({ ...SOLANA_ORDER, status: 'fulfilled', executedSellAmount: SOLANA_ORDER.sellAmount })

    expect(transformOrder(filled).status).toBe(OrderStatus.Filled)
  })

  it('derives Expired for an untouched order past validTo', () => {
    expect(transformOrder(toRawOrder(SOLANA_ORDER)).status).toBe(OrderStatus.Expired)
  })

  it('derives Cancelled for a cancelled order', () => {
    const cancelled = toRawOrder({ ...SOLANA_ORDER, status: 'cancelled' })

    expect(transformOrder(cancelled).status).toBe(OrderStatus.Cancelled)
  })

  it('keeps a fill ahead of a cancellation, matching how the book ranks them', () => {
    // Reclaiming a filled order's PDA to recover its rent stamps a cancellation, and that cleanup
    // must not make a settled order look cancelled.
    const reclaimed = toRawOrder({
      ...SOLANA_ORDER,
      status: 'fulfilled',
      executedSellAmount: SOLANA_ORDER.sellAmount,
    })

    expect(transformOrder({ ...reclaimed, invalidated: true }).status).toBe(OrderStatus.Filled)
  })
})

describe('toRawTrade', () => {
  it('renames the Solana fill fields onto their EVM counterparts', () => {
    const trade = toRawTrade(SOLANA_TRADE)

    expect(trade.orderUid).toBe(SOLANA_TRADE.orderUid)
    expect(trade.txHash).toBe(SOLANA_TRADE.txSignature)
    expect(trade.logIndex).toBe(SOLANA_TRADE.instructionIndex)
    expect(trade.blockNumber).toBe(SOLANA_TRADE.slot)
  })

  it('treats the fill amount as its own before-fees amount', () => {
    const trade = toRawTrade(SOLANA_TRADE)

    expect(trade.sellAmount).toBe(SOLANA_TRADE.sellAmount)
    expect(trade.sellAmountBeforeFees).toBe(SOLANA_TRADE.sellAmount)
  })

  it('stands in for a slot that is not indexed yet', () => {
    expect(toRawTrade({ ...SOLANA_TRADE, slot: null }).blockNumber).toBe(0)
  })
})
