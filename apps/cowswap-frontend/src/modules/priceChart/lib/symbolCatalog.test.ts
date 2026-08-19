import { NATIVE_CURRENCIES, USDC_ARBITRUM_ONE, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  createSwapChartSymbols,
  getChartFormatByTicker,
  getChartTickerByFormat,
  getDefaultPriceChartFormat,
} from './symbolCatalog'

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

  it('keeps stable format ids for the four swap chart variants', () => {
    const symbols = createSwapChartSymbols(NATIVE_CURRENCIES[SupportedChainId.ARBITRUM_ONE], USDC_ARBITRUM_ONE)

    expect(symbols.map((symbol) => symbol.selectionId)).toEqual([1, 2, 3, 4])
    expect(getDefaultPriceChartFormat(symbols)).toBe(3)
    expect(getChartTickerByFormat(symbols, 3)).toBe('ETHUSDC')
    expect(getChartFormatByTicker(symbols, 'USDCETH')).toBe(4)
  })
})
