import { OrderClass } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { getUiOrderType, UiOrderTypeParams } from './getUiOrderType'

function buildParams(overrides: Partial<UiOrderTypeParams> = {}): UiOrderTypeParams {
  return {
    class: OrderClass.MARKET,
    fullAppData: undefined,
    composableCowInfo: undefined,
    ...overrides,
  }
}

function fullAppDataWithClass(orderClass: string): string {
  return JSON.stringify({ appCode: 'CoW Swap', metadata: { orderClass: { orderClass } } })
}

describe('getUiOrderType', () => {
  it('takes the order type from the appData orderClass over the API class', () => {
    const result = getUiOrderType(buildParams({ class: OrderClass.MARKET, fullAppData: fullAppDataWithClass('limit') }))

    expect(result).toBe(UiOrderType.LIMIT)
  })

  it('prioritizes composableCowInfo (TWAP) over the appData orderClass', () => {
    const result = getUiOrderType(
      buildParams({
        fullAppData: fullAppDataWithClass('limit'),
        composableCowInfo: {} as UiOrderTypeParams['composableCowInfo'],
      }),
    )

    expect(result).toBe(UiOrderType.TWAP)
  })

  it('classifies a plain EVM market order as SWAP via the API fallback', () => {
    const result = getUiOrderType(buildParams({ class: OrderClass.MARKET }))

    expect(result).toBe(UiOrderType.SWAP)
  })

  // Solana's order-book returns no `class`. Without the fallback the order is left unclassified,
  // which drops it out of every orders-table tab and renders as "Undefined sell order".
  it('classifies an order with neither class nor appData as a market order', () => {
    const result = getUiOrderType(buildParams({ class: undefined as unknown as UiOrderTypeParams['class'] }))

    expect(result).toBe(UiOrderType.SWAP)
  })

  it('classifies a Solana limit order with no class from its appData', () => {
    const result = getUiOrderType(
      buildParams({
        class: undefined as unknown as UiOrderTypeParams['class'],
        fullAppData: fullAppDataWithClass('limit'),
      }),
    )

    expect(result).toBe(UiOrderType.LIMIT)
  })
})
