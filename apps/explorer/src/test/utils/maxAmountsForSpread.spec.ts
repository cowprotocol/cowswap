import BN from 'bn.js'
import BigNumber from 'bignumber.js'

import { UNLIMITED_ORDER_AMOUNT } from '@gnosis.pm/dex-js'
import { maxAmountsForSpread } from 'utils'

function assertSpread(
  spread: number,
  buyTokenAmount: BN,
  buyTokenPrecision: number,
  sellTokenAmount: BN,
  sellTokenPrecision: number,
): void {
  const ten = new BigNumber(10)

  const buyAmount = new BigNumber(buyTokenAmount.toString()).dividedBy(ten.exponentiatedBy(buyTokenPrecision))
  const sellAmount = new BigNumber(sellTokenAmount.toString()).dividedBy(ten.exponentiatedBy(sellTokenPrecision))

  expect(
    buyAmount
      .dividedBy(sellAmount)
      .minus(1)
      .multipliedBy(100)
      .toPrecision(new BigNumber(spread).precision(true) + 1),
  ).toMatch(new RegExp(`^${spread.toString()}`))
}

describe('invalid input', () => {
  test('negative spread', () => {
    const spread = -1

    try {
      maxAmountsForSpread({ spread, buyTokenPrecision: 1, sellTokenPrecision: 1 })
      fail('Should not reach')
    } catch (e) {
      expect(e.message).toMatch(/Invalid spread amount/)
    }
  })

  test('spread over 100%', () => {
    const spread = 200

    try {
      maxAmountsForSpread({ spread, buyTokenPrecision: 1, sellTokenPrecision: 1 })
      fail('Should not reach')
    } catch (e) {
      expect(e.message).toMatch(/Invalid spread amount/)
    }
  })
})

describe('same precision', () => {
  test('precision 2, spread 0.5%', () => {
    const precision = 2
    const spread = 0.5

    const { buyAmount, sellAmount } = maxAmountsForSpread({
      spread,
      buyTokenPrecision: precision,
      sellTokenPrecision: precision,
    })

    expect(buyAmount.toString()).toEqual(UNLIMITED_ORDER_AMOUNT.toString())

    assertSpread(spread, buyAmount, precision, sellAmount, precision)
  })

  test('precision 18, spread 1%', () => {
    const precision = 18
    const spread = 1

    const { buyAmount, sellAmount } = maxAmountsForSpread({
      spread,
      buyTokenPrecision: precision,
      sellTokenPrecision: precision,
    })

    expect(buyAmount.toString()).toEqual(UNLIMITED_ORDER_AMOUNT.toString())

    assertSpread(spread, buyAmount, precision, sellAmount, precision)
  })
})

describe('buyTokenPrecision > sellTokenPrecision', () => {
  test('buyTokenPrecision 5, sellTokenPrecision 2, spread 0.05%', () => {
    const buyTokenPrecision = 5
    const sellTokenPrecision = 2
    const spread = 0.05

    const { buyAmount, sellAmount } = maxAmountsForSpread({ spread, buyTokenPrecision, sellTokenPrecision })

    expect(buyAmount.toString()).toEqual(UNLIMITED_ORDER_AMOUNT.toString())

    assertSpread(spread, buyAmount, buyTokenPrecision, sellAmount, sellTokenPrecision)
  })

  test('buyTokenPrecision 18, sellTokenPrecision 2, spread 0.01%', () => {
    const buyTokenPrecision = 18
    const sellTokenPrecision = 2
    const spread = 0.01

    const { buyAmount, sellAmount } = maxAmountsForSpread({ spread, buyTokenPrecision, sellTokenPrecision })

    expect(buyAmount.toString()).toEqual(UNLIMITED_ORDER_AMOUNT.toString())

    assertSpread(spread, buyAmount, buyTokenPrecision, sellAmount, sellTokenPrecision)
  })
})

describe('buyTokenPrecision < sellTokenPrecision', () => {
  test('buyTokenPrecision 3, sellTokenPrecision 4, spread 0.03%', () => {
    const buyTokenPrecision = 3
    const sellTokenPrecision = 4
    const spread = 0.03

    const { buyAmount, sellAmount } = maxAmountsForSpread({ spread, buyTokenPrecision, sellTokenPrecision })

    expect(sellAmount.toString()).toEqual(UNLIMITED_ORDER_AMOUNT.toString())

    assertSpread(spread, buyAmount, buyTokenPrecision, sellAmount, sellTokenPrecision)
  })

  test('buyTokenPrecision 2, sellTokenPrecision 18, spread 0.1%', () => {
    const buyTokenPrecision = 2
    const sellTokenPrecision = 18
    const spread = 0.1

    const { buyAmount, sellAmount } = maxAmountsForSpread({ spread, buyTokenPrecision, sellTokenPrecision })

    expect(sellAmount.toString()).toEqual(UNLIMITED_ORDER_AMOUNT.toString())

    assertSpread(spread, buyAmount, buyTokenPrecision, sellAmount, sellTokenPrecision)
  })
})
