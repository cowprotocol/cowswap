/**
 * @jest-environment ./custom-test-env.js
 */

import { PriceInformation } from '@cowprotocol/cow-sdk'
import { OrderKind } from 'state/orders/actions'

import { USDC_MAINNET as USDC, USDT } from 'constants/tokens'

import { generateOrder } from 'state/orders/mocks'

import { isOrderUnfillable, orderPriceAndCurrentPriceDiff } from './utils'
import { Percent, Price } from '@uniswap/sdk-core'

// Picked stable coins with same amount of decimals (6) for making easier to visually reason the amounts
const sellToken = USDT
const buyToken = USDC

// Generate order with fake data
const ORDER = generateOrder({ owner: '0x...', sellToken, buyToken })
// Update to amounts reasonable for testing.
// Price is 1 USDC per USDT == 1 USDT/USDC
ORDER.sellAmount = '1000'
ORDER.buyAmount = '1000'

describe('orderPriceAndCurrentPriceDiff', () => {
  const order = { ...ORDER, kind: OrderKind.SELL }

  test('returns an obj with props orderPrice, currentPrice of class Price', () => {
    const price: PriceInformation = { token: buyToken.address, amount: '1001' }
    expect(orderPriceAndCurrentPriceDiff(order, price.amount as string)).toMatchObject({
      orderPrice: expect.any(Price),
      currentPrice: expect.any(Price),
      percentageDifference: expect.any(Percent),
    })
  })
})

describe('isOrderUnfillable', () => {
  describe('sell order', () => {
    const order = { ...ORDER, kind: OrderKind.SELL }
    // sellAmount is fixed at '1000'
    // more buyToken == better for you == better price

    it('is fillable - price below market, 0.1% better', () => {
      const price: PriceInformation = { token: buyToken.address, amount: '1001' }
      expect(isOrderUnfillable(order, price)).toBeFalsy()
    })
    it('is fillable - price above market < 1%, 0.1% worse', () => {
      const price: PriceInformation = { token: buyToken.address, amount: '999' }
      expect(isOrderUnfillable(order, price)).toBeFalsy()
    })
    it('is unfillable - price above market > 1%, 1.1% worse', () => {
      const price: PriceInformation = { token: buyToken.address, amount: '989' }
      expect(isOrderUnfillable(order, price)).toBeTruthy()
    })
  })
  describe('buy order', () => {
    const order = { ...ORDER, kind: OrderKind.BUY }
    // buyAmount is fixed at '1000'
    // less sellToken == better for you == better price

    it('is fillable - price below market, 0.1% better', () => {
      const price: PriceInformation = { token: sellToken.address, amount: '999' }
      expect(isOrderUnfillable(order, price)).toBeFalsy()
    })
    it('is fillable - price above market < 1%, 0.09% worse', () => {
      const price: PriceInformation = { token: sellToken.address, amount: '1001' }
      expect(isOrderUnfillable(order, price)).toBeFalsy()
    })
    it('is unfillable - price above market > 1%, 1.09% worse', () => {
      const price: PriceInformation = { token: sellToken.address, amount: '1011' }
      expect(isOrderUnfillable(order, price)).toBeTruthy()
    })
  })
})
