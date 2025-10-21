import { OrderKind } from '@cowprotocol/cow-sdk'
import type { OnPostedOrderPayload, OnFulfilledOrderPayload } from '@cowprotocol/events'
import type { TokenInfo } from '@cowprotocol/types'

import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'util'
;(global as unknown as { TextDecoder?: typeof NodeTextDecoder; TextEncoder?: typeof NodeTextEncoder }).TextDecoder =
  NodeTextDecoder
;(global as unknown as { TextDecoder?: typeof NodeTextDecoder; TextEncoder?: typeof NodeTextEncoder }).TextEncoder =
  NodeTextEncoder

const { mapPostedOrder, mapFulfilledOrder, extractTokenMeta } =
  require('./orderLifecycleAnalytics') as typeof import('./orderLifecycleAnalytics')

describe('extractTokenMeta', () => {
  it('returns empty object for missing order', () => {
    expect(extractTokenMeta(undefined)).toEqual({})
  })

  it('only returns tokens with an address', () => {
    const tokenWithAddress: TokenInfo = {
      chainId: 1,
      address: '0x0000000000000000000000000000000000000003',
      symbol: 'TK3',
      name: 'Token 3',
      decimals: 6,
    }

    const result = extractTokenMeta({
      inputToken: tokenWithAddress,
      outputToken: {
        chainId: 1,
        address: '',
        symbol: 'TK4',
        name: 'Token 4',
        decimals: 18,
      },
    })

    expect(result).toEqual({
      inputToken: tokenWithAddress,
      outputToken: undefined,
    })
  })
})

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
  partiallyFillable: true,
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
        partiallyFillable: true,
        isEthFlow: false,
      }),
    )
  })

  it('falls back for nullish string fields', () => {
    const result = mapPostedOrder({ ...basePostedPayload, owner: null } as unknown as OnPostedOrderPayload)

    expect(result).toEqual(expect.objectContaining({ walletAddress: '' }))
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

  it('falls back to raw amounts when token metadata is incomplete', () => {
    const missingMetaPayload = {
      ...basePostedPayload,
      inputToken: { ...basePostedPayload.inputToken, decimals: undefined as unknown as number, symbol: undefined },
      outputToken: { ...basePostedPayload.outputToken, decimals: undefined as unknown as number, symbol: undefined },
    } as unknown as OnPostedOrderPayload

    const result = mapPostedOrder(missingMetaPayload)

    expect(result).toEqual(
      expect.objectContaining({
        sellAmountUnits: undefined,
        buyAmountUnits: undefined,
        from_amount: basePostedPayload.inputAmount.toString(),
        to_amount: basePostedPayload.outputAmount.toString(),
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

  it('detects bridge orders from nested order payloads', () => {
    const nestedBridgePayload = {
      ...basePostedPayload,
      bridgeOrder: undefined,
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
        bridgeOrder: { id: 'bridge' },
      },
    } as unknown as OnFulfilledOrderPayload

    const result = mapFulfilledOrder(nestedBridgePayload)

    expect(result.isCrossChain).toBe(true)
  })

  it('falls back to raw executed amounts when formatting fails', () => {
    const payload = {
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
      },
    } as unknown as OnFulfilledOrderPayload

    const result = mapFulfilledOrder(payload)

    expect(result).toEqual(
      expect.objectContaining({
        executedSellAmountUnits: undefined,
        executedBuyAmountUnits: undefined,
        from_amount: '500000000000000000',
        to_amount: '1250000',
      }),
    )
  })
})
