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

describe('getUiOrderType', () => {
  it('recognizes a Solana order signed with the staging limit-order appData constant, regardless of its class', async () => {
    const result = getUiOrderType(
      buildParams({
        class: OrderClass.MARKET,
        appData: SOLANA_LIMIT_ORDER_STAGING_APP_DATA,
        inputToken: { chainId: SupportedChainId.SOLANA } as UiOrderTypeParams['inputToken'],
      }),
    )

    expect(result).toBe(UiOrderType.LIMIT)
  })

  it('recognizes a Solana order signed with the prod limit-order appData constant', async () => {
    const result = getUiOrderType(
      buildParams({
        class: OrderClass.MARKET,
        appData: SOLANA_LIMIT_ORDER_PROD_APP_DATA,
        inputToken: { chainId: SupportedChainId.SOLANA } as UiOrderTypeParams['inputToken'],
      }),
    )

    expect(result).toBe(UiOrderType.LIMIT)
  })

  it('does not special-case a non-Solana order carrying the same constant by coincidence', async () => {
    const result = getUiOrderType(
      buildParams({
        class: OrderClass.MARKET,
        appData: SOLANA_LIMIT_ORDER_STAGING_APP_DATA,
        inputToken: { chainId: SupportedChainId.MAINNET } as UiOrderTypeParams['inputToken'],
      }),
    )

    expect(result).toBe(UiOrderType.SWAP)
  })

  it('falls back to the API order class for a Solana order whose appData matches neither constant', async () => {
    const result = getUiOrderType(
      buildParams({
        class: OrderClass.LIMIT,
        appData: '{}',
        inputToken: { chainId: SupportedChainId.SOLANA } as UiOrderTypeParams['inputToken'],
      }),
    )

    expect(result).toBe(UiOrderType.LIMIT)
  })

  it('still prioritizes composableCowInfo (TWAP) over the Solana appData check', async () => {
    const result = getUiOrderType(
      buildParams({
        class: OrderClass.MARKET,
        appData: SOLANA_LIMIT_ORDER_STAGING_APP_DATA,
        inputToken: { chainId: SupportedChainId.SOLANA } as UiOrderTypeParams['inputToken'],
        composableCowInfo: {} as UiOrderTypeParams['composableCowInfo'],
      }),
    )

    expect(result).toBe(UiOrderType.TWAP)
  })

  it('classifies a plain EVM market order as SWAP via the API fallback', async () => {
    const result = getUiOrderType(buildParams({ class: OrderClass.MARKET }))

    expect(result).toBe(UiOrderType.SWAP)
  })
})
