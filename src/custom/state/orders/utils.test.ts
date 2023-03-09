/**
 * @jest-environment ./custom-test-env.js
 */

import { OrderKind } from 'state/orders/actions'

import { USDC_MAINNET as USDC, USDT } from 'constants/tokens'

import { generateOrder } from 'state/orders/mocks'

import { getOrderExecutionPrice, isOrderUnfillable } from './utils'
import { Price } from '@uniswap/sdk-core'

// Picked stable coins with same amount of decimals (6) for making easier to visually reason the amounts
const sellToken = USDT
const buyToken = USDC

// Generate order with fake data
const ORDER = generateOrder({ owner: '0x...', sellToken, buyToken })
// Update to amounts reasonable for testing.
// Price is 1 USDC per USDT == 1 USDT/USDC
ORDER.sellAmount = '1000'
ORDER.buyAmount = '1000'

describe('isOrderUnfillable', () => {
  describe('sell order', () => {
    const order = { ...ORDER, kind: OrderKind.SELL }
    // sellAmount is fixed at '1000'
    // more buyToken == better for you == better price

    it('is fillable - price below market, 0.1% better', () => {
      const price = '1001'
      const fee = '1'

      const orderPrice = new Price(
        order.inputToken,
        order.outputToken,
        order.sellAmount.toString(),
        order.buyAmount.toString()
      )
      const executionPrice = getOrderExecutionPrice(order, price, fee)

      expect(isOrderUnfillable(order, orderPrice, executionPrice)).toBeFalsy()
    })

    it('is fillable - price above market < 1%, 0.1% worse', () => {
      const price = '999'
      const fee = '1'

      const orderPrice = new Price(
        order.inputToken,
        order.outputToken,
        order.sellAmount.toString(),
        order.buyAmount.toString()
      )
      const executionPrice = getOrderExecutionPrice(order, price, fee)

      expect(isOrderUnfillable(order, orderPrice, executionPrice)).toBeFalsy()
    })

    it('is unfillable - price above market > 1%, 1.1% worse', () => {
      const price = '989'
      const fee = '1'

      const orderPrice = new Price(
        order.inputToken,
        order.outputToken,
        order.sellAmount.toString(),
        order.buyAmount.toString()
      )
      const executionPrice = getOrderExecutionPrice(order, price, fee)

      expect(isOrderUnfillable(order, orderPrice, executionPrice)).toBeTruthy()
    })
  })
  describe('buy order', () => {
    const order = { ...ORDER, kind: OrderKind.BUY }
    // buyAmount is fixed at '1000'
    // less sellToken == better for you == better price

    it('is fillable - price below market, 0.1% better', () => {
      const price = '999'
      const fee = '1'

      const orderPrice = new Price(
        order.inputToken,
        order.outputToken,
        order.sellAmount.toString(),
        order.buyAmount.toString()
      )
      const executionPrice = getOrderExecutionPrice(order, price, fee)

      expect(isOrderUnfillable(order, orderPrice, executionPrice)).toBeFalsy()
    })

    it('is fillable - price above market < 1%, 0.09% worse', () => {
      const price = '1001'
      const fee = '1'

      const orderPrice = new Price(
        order.inputToken,
        order.outputToken,
        order.sellAmount.toString(),
        order.buyAmount.toString()
      )
      const executionPrice = getOrderExecutionPrice(order, price, fee)

      expect(isOrderUnfillable(order, orderPrice, executionPrice)).toBeFalsy()
    })

    it('is unfillable - price above market > 1%, 1.09% worse', () => {
      const price = '1011'
      const fee = '1'

      const orderPrice = new Price(
        order.inputToken,
        order.outputToken,
        order.sellAmount.toString(),
        order.buyAmount.toString()
      )
      const executionPrice = getOrderExecutionPrice(order, price, fee)

      expect(isOrderUnfillable(order, orderPrice, executionPrice)).toBeTruthy()
    })
  })
})
