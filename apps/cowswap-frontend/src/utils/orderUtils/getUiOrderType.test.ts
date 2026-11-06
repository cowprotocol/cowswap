import { SOLANA_LIMIT_ORDER_PROD_APP_DATA, SOLANA_LIMIT_ORDER_STAGING_APP_DATA } from '@cowprotocol/common-const'
import { OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { getUiOrderType, UiOrderTypeParams } from './getUiOrderType'

function buildParams(overrides: Partial<UiOrderTypeParams> = {}): UiOrderTypeParams {
  return {
    class: OrderClass.MARKET,
    fullAppData: undefined,
    composableCowInfo: undefined,
    appData: '{}',
    inputToken: { chainId: SupportedChainId.MAINNET } as UiOrderTypeParams['inputToken'],
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

describe('getUiOrderType · legacy Solana appData constants', () => {
  const solanaToken = { chainId: SupportedChainId.SOLANA } as UiOrderTypeParams['inputToken']

  it.each([
    ['staging', SOLANA_LIMIT_ORDER_STAGING_APP_DATA],
    ['prod', SOLANA_LIMIT_ORDER_PROD_APP_DATA],
  ])('recognizes a Solana order signed with the %s limit-order constant, regardless of its class', (_env, appData) => {
    const result = getUiOrderType(buildParams({ class: OrderClass.MARKET, appData, inputToken: solanaToken }))

    expect(result).toBe(UiOrderType.LIMIT)
  })

  it('does not special-case a non-Solana order carrying the same constant by coincidence', () => {
    const result = getUiOrderType(
      buildParams({
        class: OrderClass.MARKET,
        appData: SOLANA_LIMIT_ORDER_STAGING_APP_DATA,
        inputToken: { chainId: SupportedChainId.MAINNET } as UiOrderTypeParams['inputToken'],
      }),
    )

    expect(result).toBe(UiOrderType.SWAP)
  })

  it('still prioritizes composableCowInfo (TWAP) over the constant', () => {
    const result = getUiOrderType(
      buildParams({
        class: OrderClass.MARKET,
        appData: SOLANA_LIMIT_ORDER_STAGING_APP_DATA,
        inputToken: solanaToken,
        composableCowInfo: {} as UiOrderTypeParams['composableCowInfo'],
      }),
    )

    expect(result).toBe(UiOrderType.TWAP)
  })

  // The flag can be turned on while orders signed under the old scheme are still open.
  it('keeps classifying a legacy order once a registered doc is the norm', () => {
    const result = getUiOrderType(
      buildParams({
        class: undefined as unknown as UiOrderTypeParams['class'],
        appData: SOLANA_LIMIT_ORDER_PROD_APP_DATA,
        inputToken: solanaToken,
      }),
    )

    expect(result).toBe(UiOrderType.LIMIT)
  })

  it('falls back to the API order class for a Solana order whose appData matches neither constant', () => {
    const result = getUiOrderType(buildParams({ class: OrderClass.LIMIT, appData: '{}', inputToken: solanaToken }))

    expect(result).toBe(UiOrderType.LIMIT)
  })
})
