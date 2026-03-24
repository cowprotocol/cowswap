import { NATIVE_CURRENCIES, USDC_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getSelectedPriceLimitRate } from './priceLimitLine.utils'
import { createSwapChartSymbols } from './symbolCatalog'

describe('priceLimitLine.utils', () => {
  const inputCurrency = NATIVE_CURRENCIES[SupportedChainId.MAINNET]
  const outputCurrency = USDC_MAINNET
  const symbols = createSwapChartSymbols(inputCurrency, outputCurrency)

  it('maps direct pair chart selections to exact limit rates', () => {
    const selectedRate = getSelectedPriceLimitRate(
      'ETHUSDC',
      symbols,
      inputCurrency,
      outputCurrency,
      1234.5,
      null,
      null,
    )

    expect(selectedRate?.toSignificant(10)).toBe('1234.5')
  })

  it('maps inverse pair chart selections to exact inverse limit rates', () => {
    const selectedRate = getSelectedPriceLimitRate(
      'USDCETH',
      symbols,
      inputCurrency,
      outputCurrency,
      0.0005,
      null,
      null,
    )

    expect(selectedRate?.toSignificant(10)).toBe('2000')
  })
})
