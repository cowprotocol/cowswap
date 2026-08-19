import { NATIVE_CURRENCIES, USDC_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Fraction } from '@cowprotocol/currency'

import { getActivePriceLimitLinePrice, getLimitPriceFromRate, getSelectedPriceLimitRate } from './priceLimitLine.utils'
import { createSwapChartSymbols } from './symbolCatalog'

describe('priceLimitLine.utils', () => {
  const inputCurrency = NATIVE_CURRENCIES[SupportedChainId.MAINNET]
  const outputCurrency = USDC_MAINNET
  const symbols = createSwapChartSymbols(inputCurrency, outputCurrency)
  const sellSymbol = symbols.find((symbol) => symbol.selection === 'sell')
  const buySymbol = symbols.find((symbol) => symbol.selection === 'buy')

  describe('active limit line', () => {
    const rate = new Fraction(2000)
    const limitPrice = getLimitPriceFromRate(inputCurrency, outputCurrency, rate)

    it('returns the USD limit price when conversion is available', () => {
      expect(getActivePriceLimitLinePrice(sellSymbol, limitPrice, inputCurrency, outputCurrency, null, 1)).toBe(2000)
    })

    it('preserves the rate across currencies with different decimals', () => {
      expect(limitPrice?.toSignificant(10)).toBe('2000')
    })
  })

  it('maps input USD chart selections to limit rates', () => {
    const selectedRate = getSelectedPriceLimitRate(sellSymbol, inputCurrency, outputCurrency, 1234.5, null, 1)

    expect(selectedRate?.toSignificant(10)).toBe('1234.5')
  })

  it('maps output USD chart selections to inverse limit rates', () => {
    const selectedRate = getSelectedPriceLimitRate(buySymbol, inputCurrency, outputCurrency, 1, 2000, null)

    expect(selectedRate?.toSignificant(10)).toBe('2000')
  })
})
