import { NATIVE_CURRENCIES, USDC_ARBITRUM_ONE, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createSwapChartSymbols } from './symbolCatalog'

describe('symbolCatalog', () => {
  it('uses wrapped native addresses for Codex requests while keeping native display symbols', () => {
    const symbols = createSwapChartSymbols(NATIVE_CURRENCIES[SupportedChainId.ARBITRUM_ONE], USDC_ARBITRUM_ONE)

    expect(symbols[0]).toMatchObject({
      baseAsset: {
        address: WRAPPED_NATIVE_CURRENCIES[SupportedChainId.ARBITRUM_ONE].address.toLowerCase(),
        symbol: 'ETH',
      },
      ticker: 'ETHUSD',
    })
  })
})
