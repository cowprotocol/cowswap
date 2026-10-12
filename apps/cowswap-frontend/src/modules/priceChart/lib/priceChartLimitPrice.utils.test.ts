import { NATIVE_CURRENCIES, USDC_MAINNET } from '@cowprotocol/common-const'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Fraction } from '@cowprotocol/currency'

import {
  getActivePriceLimitLinePrice,
  getLimitPriceFromRate,
  getSelectedPriceLimitRate,
} from './priceChartLimitPrice.utils'

describe('priceChartLimitPrice.utils', () => {
  const inputCurrency = NATIVE_CURRENCIES[SupportedChainId.MAINNET]
  const outputCurrency = USDC_MAINNET
  const sellSymbol = inputCurrency
  const buySymbol = outputCurrency

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
  it('accepts the wrapped native currency and inverted limit price', () => {
    const price = getLimitPriceFromRate(inputCurrency, outputCurrency, new Fraction(2000))
    expect(
      getActivePriceLimitLinePrice(
        getWrappedToken(inputCurrency),
        price.invert(),
        inputCurrency,
        outputCurrency,
        null,
        1,
      ),
    ).toBe(2000)
  })

  it('preserves fractional rates with different token decimals', () => {
    expect(getLimitPriceFromRate(inputCurrency, outputCurrency, new Fraction(1, 3)).toSignificant(10)).toBe(
      '0.3333333333',
    )
  })

  it.each([0, -1, NaN, Infinity])('ignores invalid selected prices: %s', (price) => {
    expect(getSelectedPriceLimitRate(inputCurrency, inputCurrency, outputCurrency, price, null, 1)).toBeNull()
  })

  it('ignores missing conversion prices and overflowing rates', () => {
    expect(getSelectedPriceLimitRate(inputCurrency, inputCurrency, outputCurrency, 1, null, null)).toBeNull()
    expect(
      getSelectedPriceLimitRate(inputCurrency, inputCurrency, outputCurrency, Number.MAX_VALUE, null, Number.MIN_VALUE),
    ).toBeNull()
  })
})
