import { OrderClass, OrderKind, OrderStatus, SigningScheme } from '@cowprotocol/cow-sdk'
import type { EnrichedOrder, TokenInfo } from '@cowprotocol/cow-sdk'
import type {
  OnPostedOrderPayload,
  OnFulfilledOrderPayload,
  OnCancelledOrderPayload,
  OnExpiredOrderPayload,
} from '@cowprotocol/events'
import { UiOrderType } from '@cowprotocol/types'

import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'util'

const globals = globalThis as unknown as { TextDecoder?: typeof NodeTextDecoder; TextEncoder?: typeof NodeTextEncoder }
const previousGlobals = { TextDecoder: globals.TextDecoder, TextEncoder: globals.TextEncoder }
globals.TextDecoder = NodeTextDecoder
globals.TextEncoder = NodeTextEncoder

afterAll(() => {
  globals.TextDecoder = previousGlobals.TextDecoder
  globals.TextEncoder = previousGlobals.TextEncoder
})

const { mapPostedOrder, mapFulfilledOrder, mapCancelledOrder, mapExpiredOrder } =
  require('./orderLifecycleAnalytics') as typeof import('./orderLifecycleAnalytics')

const defaultInputToken: TokenInfo = {
  address: '0x0000000000000000000000000000000000000001',
  symbol: 'SELL',
  decimals: 18,
  chainId: 1,
  name: 'Sell Token',
}

const defaultOutputToken: TokenInfo = {
  address: '0x0000000000000000000000000000000000000002',
  symbol: 'BUY',
  decimals: 6,
  chainId: 1,
  name: 'Buy Token',
}

function buildOrder(overrides: Partial<EnrichedOrder> = {}): EnrichedOrder {
  return {
    sellToken: defaultInputToken.address,
    buyToken: defaultOutputToken.address,
    receiver: null,
    sellAmount: '1000000000000000000',
    buyAmount: '1000000',
    validTo: 0,
    feeAmount: '0',
    kind: OrderKind.SELL,
    partiallyFillable: true,
    signingScheme: SigningScheme.EIP712,
    signature: '0xsignature',
    creationDate: '2024-01-01T00:00:00.000Z',
    class: OrderClass.LIMIT,
    owner: '0xowner',
    uid: '0xuid',
    executedSellAmount: '0',
    executedSellAmountBeforeFees: '0',
    executedBuyAmount: '0',
    executedFeeAmount: '0',
    invalidated: false,
    status: OrderStatus.OPEN,
    totalFee: '0',
    inputToken: defaultInputToken,
    outputToken: defaultOutputToken,
    ...overrides,
  } as unknown as EnrichedOrder
}

describe('orderLifecycleAnalytics', () => {
  it('formats posted order aliases', () => {
    const payload: OnPostedOrderPayload = {
      owner: '0xowner',
      orderUid: '0xuid',
      chainId: 1,
      inputToken: {
        address: '0x0000000000000000000000000000000000000001',
        symbol: 'SELL',
        decimals: 18,
        chainId: 1,
        name: 'Sell Token',
      },
      outputToken: {
        address: '0x0000000000000000000000000000000000000002',
        symbol: 'BUY',
        decimals: 6,
        chainId: 1,
        name: 'Buy Token',
      },
      inputAmount: BigInt('1000000000000000000'),
      outputAmount: BigInt('2500000'),
      orderType: UiOrderType.SWAP,
      partiallyFillable: true,
      kind: OrderKind.SELL,
    }

    const result = mapPostedOrder(payload)
    expect(result.sellAmountUnits).toBe('1')
    expect(result).toMatchObject({ fromAmount: '1', toAmount: '2.5', fromCurrency: 'SELL' })
  })

  it('formats fulfilled order amounts and cross-chain flag', () => {
    const payload: OnFulfilledOrderPayload = {
      chainId: 1,
      order: buildOrder({
        executedSellAmount: '1000000000000000000',
        executedBuyAmount: '999410',
        executedFeeAmount: '1234',
      }),
      bridgeOrder: { id: 'bridge' } as unknown as OnFulfilledOrderPayload['bridgeOrder'],
    }

    const result = mapFulfilledOrder(payload)
    expect(result.fromAmount).toBe('1')
    expect(result.toAmount).toBe('0.99941')
    expect(result.executedSellAmountUnits).toBe('1')
    expect(result.executedBuyAmountUnits).toBe('0.99941')
    expect(result.isCrossChain).toBe(true)
  })

  it('adds cancellation metadata and preserves aliases', () => {
    const payload: OnCancelledOrderPayload = {
      chainId: 1,
      order: buildOrder(),
      transactionHash: '0xdeadbeef',
    }

    const result = mapCancelledOrder(payload)
    expect(result.reason).toBe('cancelled')
    expect(result.transactionHash).toBe('0xdeadbeef')
    expect(result.fromCurrencyAddress).toBe(defaultInputToken.address)
    expect(result.toCurrencyAddress).toBe(defaultOutputToken.address)
  })

  it('marks expired orders with reason and aliases', () => {
    const payload: OnExpiredOrderPayload = {
      chainId: 1,
      order: buildOrder(),
    }

    const result = mapExpiredOrder(payload)
    expect(result.reason).toBe('expired')
    expect(result.fromCurrencyAddress).toBe(defaultInputToken.address)
    expect(result.toCurrencyAddress).toBe(defaultOutputToken.address)
  })
})
