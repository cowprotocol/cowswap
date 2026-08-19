import { NATIVE_CURRENCIES, USDC_ARBITRUM_ONE, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { createSwapChartSymbols } from './symbolCatalog'

describe('symbolCatalog', () => {
  it('uses wrapped native addresses for Codex requests while keeping native display symbols', () => {
    const symbols = createSwapChartSymbols(NATIVE_CURRENCIES[SupportedChainId.ARBITRUM_ONE], USDC_ARBITRUM_ONE)

    expect(symbols[0]).toMatchObject({
      baseAsset: {
        address: getAddressKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.ARBITRUM_ONE].address),
        chainId: SupportedChainId.ARBITRUM_ONE,
        symbol: 'ETH',
      },
      ticker: 'ETHUSD',
    })
  })

  it('offers one USD chart for each swap asset', () => {
    const symbols = createSwapChartSymbols(NATIVE_CURRENCIES[SupportedChainId.ARBITRUM_ONE], USDC_ARBITRUM_ONE)

    expect(symbols.map((symbol) => symbol.selection)).toEqual(['sell', 'buy'])
    expect(symbols.map((symbol) => symbol.ticker)).toEqual(['ETHUSD', 'USDCUSD'])
  })
})
