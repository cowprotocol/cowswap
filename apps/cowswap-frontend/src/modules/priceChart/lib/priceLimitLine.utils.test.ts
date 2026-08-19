import { NATIVE_CURRENCIES, USDC_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getSelectedPriceLimitRate } from './priceLimitLine.utils'
import { createSwapChartSymbols } from './symbolCatalog'

describe('priceLimitLine.utils', () => {
  const inputCurrency = NATIVE_CURRENCIES[SupportedChainId.MAINNET]
  const outputCurrency = USDC_MAINNET
  const symbols = createSwapChartSymbols(inputCurrency, outputCurrency)
  const sellSymbol = symbols.find((symbol) => symbol.selection === 'sell')
  const buySymbol = symbols.find((symbol) => symbol.selection === 'buy')

  it('maps input USD chart selections to limit rates', () => {
    const selectedRate = getSelectedPriceLimitRate(sellSymbol, inputCurrency, outputCurrency, 1234.5, null, 1)

    expect(selectedRate?.toSignificant(10)).toBe('1234.5')
  })

  it('maps output USD chart selections to inverse limit rates', () => {
    const selectedRate = getSelectedPriceLimitRate(buySymbol, inputCurrency, outputCurrency, 1, 2000, null)

    expect(selectedRate?.toSignificant(10)).toBe('2000')
  })
})
