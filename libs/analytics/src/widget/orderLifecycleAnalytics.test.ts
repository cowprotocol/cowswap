import { OrderKind } from '@cowprotocol/cow-sdk'
import type { OnPostedOrderPayload } from '@cowprotocol/events'
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

const { mapPostedOrder } = require('./orderLifecycleAnalytics') as typeof import('./orderLifecycleAnalytics')

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
    expect(result).toMatchObject({ from_amount: '1', to_amount: '2.5', from_currency: 'SELL' })
  })
})
