import { OrderKind } from '@cowprotocol/cow-sdk'
import type { OnPostedOrderPayload, OnFulfilledOrderPayload } from '@cowprotocol/events'

import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'util'
;(global as unknown as { TextDecoder?: typeof NodeTextDecoder; TextEncoder?: typeof NodeTextEncoder }).TextDecoder =
  NodeTextDecoder
;(global as unknown as { TextDecoder?: typeof NodeTextDecoder; TextEncoder?: typeof NodeTextEncoder }).TextEncoder =
  NodeTextEncoder

const { mapPostedOrder, mapFulfilledOrder } =
  require('./orderLifecycleAnalytics') as typeof import('./orderLifecycleAnalytics')

const basePostedPayload = {
  owner: '0xowner',
  orderUid: '0xorder',
  chainId: 1,
  inputToken: {
    address: '0x0000000000000000000000000000000000000001',
    symbol: 'TK1',
    decimals: 18,
    chainId: 1,
    name: 'Token 1',
  },
  outputToken: {
    address: '0x0000000000000000000000000000000000000002',
    symbol: 'TK2',
    decimals: 6,
    chainId: 1,
    name: 'Token 2',
  },
  inputAmount: BigInt('1000000000000000000'),
  outputAmount: BigInt('2500000'),
  orderType: 'swap',
  kind: OrderKind.SELL,
  receiver: '0xreceiver',
  orderCreationHash: '0xhash',
} as unknown as OnPostedOrderPayload

describe('order lifecycle analytics mappers', () => {
  it('maps posted order payload with formatted aliases', () => {
    const result = mapPostedOrder(basePostedPayload)

    expect(result).toEqual(
      expect.objectContaining({
        walletAddress: '0xowner',
        orderId: '0xorder',
        chainId: '1',
        sellToken: '0x0000000000000000000000000000000000000001',
        buyToken: '0x0000000000000000000000000000000000000002',
        sellAmountUnits: '1',
        buyAmountUnits: '2.5',
        from_currency: 'TK1',
        to_currency: 'TK2',
        from_amount: '1',
        to_amount: '2.5',
      }),
    )
  })

  it('maps fulfilled order payload with executed totals', () => {
    const fulfilledPayload = {
      ...basePostedPayload,
      order: {
        owner: '0xowner',
        uid: '0xorder',
        sellToken: '0x0000000000000000000000000000000000000001',
        buyToken: '0x0000000000000000000000000000000000000002',
        sellAmount: '1000000000000000000',
        buyAmount: '2500000',
        executedSellAmount: '500000000000000000',
        executedBuyAmount: '1250000',
        executedFeeAmount: '1000000000000000',
        inputToken: {
          decimals: 18,
          symbol: 'TK1',
          chainId: 1,
          address: '0x0000000000000000000000000000000000000001',
          name: 'Token 1',
        },
        outputToken: {
          decimals: 6,
          symbol: 'TK2',
          chainId: 1,
          address: '0x0000000000000000000000000000000000000002',
          name: 'Token 2',
        },
      },
      bridgeOrder: { id: 'bridge' },
    } as unknown as OnFulfilledOrderPayload

    const result = mapFulfilledOrder(fulfilledPayload)

    expect(result).toEqual(
      expect.objectContaining({
        executedSellAmountUnits: '0.5',
        executedBuyAmountUnits: '1.25',
        executedFeeAmountUnits: '0.001',
        from_amount: '0.5',
        to_amount: '1.25',
        isCrossChain: true,
      }),
    )
  })

  it('formats atoms across different decimals', () => {
    const samples: Array<{ value: bigint; decimals: number; expected: string }> = [
      { value: BigInt('1000000000000000000'), decimals: 18, expected: '1' },
      { value: BigInt('2500000'), decimals: 6, expected: '2.5' },
      { value: BigInt('1'), decimals: 18, expected: '0.000000000000000001' },
    ]

    samples.forEach(({ value, decimals, expected }) => {
      const formatted = (mapPostedOrder({
        ...basePostedPayload,
        inputAmount: value,
        inputToken: { ...basePostedPayload.inputToken, decimals },
      }) as { sellAmountUnits?: string }).sellAmountUnits

      expect(formatted).toBe(expected)
    })
  })
})
