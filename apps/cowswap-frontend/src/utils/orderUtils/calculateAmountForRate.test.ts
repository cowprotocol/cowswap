import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

describe('calculateAmountForRate', () => {
  it('When multiply an amount to a price instead of fraction, then the result will be zero', () => {
    const priceAsFraction = new Fraction('320778000000000000000000000000000000', '99995600000000000000000000000000') // 3207.921148
    const price = new Price({
      baseAmount: CurrencyAmount.fromRawAmount(WETH_MAINNET, '1000000000000000000'),
      quoteAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '3208940687'),
    })
    const value = CurrencyAmount.fromRawAmount(WETH_MAINNET, '1000000')

    const resultAfterFraction = value.multiply(priceAsFraction).quotient.toString()
    const resultAfterPrice = value.multiply(price).quotient.toString()

    expect(resultAfterFraction).toBe('3207921148') // 3207.921148
    expect(resultAfterPrice).toBe('0')
  })

  it('When multiply an amount to a price numerator and divide to denominator, then the result will be zero', () => {
    const price = new Price({
      baseAmount: CurrencyAmount.fromRawAmount(WETH_MAINNET, '1000000000000000000'),
      quoteAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '3208940687'),
    })
    const value = CurrencyAmount.fromRawAmount(WETH_MAINNET, '1000000')

    expect(value.numerator.toString()).toBe('1000000')
    expect(value.denominator.toString()).toBe('1')

    expect(price.numerator.toString()).toBe('3208940687')
    expect(price.denominator.toString()).toBe('1000000000000000000')

    /**
     * The code bellow is the same if we multiply CurrencyAmount to Price
     * I just revealed it to demonstrate a problem
     * When we do this multiplication, we get a new Fraction where numerator and denominator have different length
     */
    expect(JSBI.multiply(value.numerator, price.numerator).toString()).toBe('3208940687000000')
    expect(JSBI.multiply(value.denominator, price.denominator).toString()).toBe('1000000000000000000')

    const multiplied = new Fraction(
      JSBI.multiply(value.numerator, price.numerator),
      JSBI.multiply(value.denominator, price.denominator),
    )

    /**
     * This is still valid fraction, and it does make sense, but let's see what we get bellow
     */
    expect(multiplied.toFixed(10)).toBe('0.0032089407')

    expect(multiplied.numerator.toString()).toBe('3208940687000000') // length 16
    expect(multiplied.denominator.toString()).toBe('1000000000000000000') // length 19

    /**
     * Inside of JSBI.divide() it compares number lengths using __absoluteCompare() and if they are different it just returns zero
     * *** It happens, because the Price was constructed from CurrencyAmounts with different decimals
     * *** To avoid that FractionUtils.fromPrice() in order to normalize the Fraction
     */
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((JSBI as any).__absoluteCompare(multiplied.numerator, multiplied.denominator)).toBe(-1)
    expect(JSBI.divide(multiplied.numerator, multiplied.denominator).toString()).toBe('0')
  })
})
