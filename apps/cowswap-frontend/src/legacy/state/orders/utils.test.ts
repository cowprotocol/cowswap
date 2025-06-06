import { USDC_MAINNET as USDC, USDT } from '@cowprotocol/common-const'
import { OrderKind, OrderStatus, SigningScheme } from '@cowprotocol/cow-sdk'
import { Price } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { generateOrder } from './mocks'
import { classifyOrder, getOrderMarketPrice, isOrderUnfillable } from './utils'

// Picked stable coins with same amount of decimals (6) for making easier to visually reason the amounts
const sellToken = USDT
const buyToken = USDC

// Generate order with fake data
const ORDER = generateOrder({ owner: '0x...', sellToken, buyToken })
// Update to amounts reasonable for testing.
// Price is 1 USDC per USDT == 1 USDT/USDC
ORDER.sellAmount = '1000'
ORDER.sellAmountBeforeFee = '1000'
ORDER.buyAmount = '1000'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
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
      const executionPrice = getOrderMarketPrice(order, price, fee)

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
      const executionPrice = getOrderMarketPrice(order, price, fee)

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
      const executionPrice = getOrderMarketPrice(order, price, fee)

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
      const executionPrice = getOrderMarketPrice(order, price, fee)

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
      const executionPrice = getOrderMarketPrice(order, price, fee)

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
      const executionPrice = getOrderMarketPrice(order, price, fee)

      expect(isOrderUnfillable(order, orderPrice, executionPrice)).toBeTruthy()
    })
  })
})

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('classifyOrder', () => {
  const BASE_ORDER: Parameters<typeof classifyOrder>[0] = {
    uid: '0x0000000000...',
    validTo: +ORDER.validTo,
    creationDate: new Date(Date.now() - ms`1h`).toISOString(),
    invalidated: false,
    buyAmount: '1000',
    sellAmount: '1000',
    executedBuyAmount: '0',
    executedSellAmountBeforeFees: '0',
    kind: OrderKind.SELL,
    signingScheme: SigningScheme.EIP712,
    status: OrderStatus.OPEN,
  }

  describe('unknown', () => {
    it('returns unknown when null', () => {
      expect(classifyOrder(null)).toBe('unknown')
    })
  })
  describe('fulfilled', () => {
    it('is sell', () => {
      const order: typeof BASE_ORDER = { ...BASE_ORDER, executedSellAmountBeforeFees: BASE_ORDER.sellAmount }
      expect(classifyOrder(order)).toBe('fulfilled')
    })

    it('is buy', () => {
      const order: typeof BASE_ORDER = { ...BASE_ORDER, executedBuyAmount: BASE_ORDER.buyAmount, kind: OrderKind.BUY }
      expect(classifyOrder(order)).toBe('fulfilled')
    })
  })
  describe('expired', () => {
    it('is expired when validTo in the past', () => {
      const order: typeof BASE_ORDER = { ...BASE_ORDER, validTo: (Date.now() - ms`50 min`) / 1000 }
      expect(classifyOrder(order)).toBe('expired')
    })
  })
  describe('cancelled', () => {
    it('is cancelled when invalidated for more than X time', () => {
      const order: typeof BASE_ORDER = { ...BASE_ORDER, invalidated: true }
      expect(classifyOrder(order)).toBe('cancelled')
    })
  })
  describe('presignaturePending', () => {
    it('is pending pre-signature', () => {
      const order: typeof BASE_ORDER = { ...BASE_ORDER, status: OrderStatus.PRESIGNATURE_PENDING }
      expect(classifyOrder(order)).toBe('presignaturePending')
    })
  })
  describe('presigned', () => {
    it('is presigned when open and signScheme is presign', () => {
      const order: typeof BASE_ORDER = { ...BASE_ORDER, signingScheme: SigningScheme.PRESIGN }
      expect(classifyOrder(order)).toBe('presigned')
    })
  })
  describe('pending', () => {
    // Fulfilled rejects
    it('has not sold 100%', () => {
      const order: typeof BASE_ORDER = { ...BASE_ORDER, executedSellAmountBeforeFees: '100' }
      expect(classifyOrder(order)).toBe('pending')
    })

    it('has not bought 100%', () => {
      const order: typeof BASE_ORDER = { ...BASE_ORDER, executedBuyAmount: '100', kind: OrderKind.BUY }
      expect(classifyOrder(order)).toBe('pending')
    })

    // Expired rejects
    it('expired but within buffer', () => {
      const order: typeof BASE_ORDER = { ...BASE_ORDER, validTo: (Date.now() - ms`30s`) / 1000 }
      expect(classifyOrder(order)).toBe('pending')
    })

    // Cancelled rejects
    it('invalidated but within buffer', () => {
      const order: typeof BASE_ORDER = {
        ...BASE_ORDER,
        invalidated: true,
        creationDate: new Date(Date.now() - ms`30s`).toISOString(),
      }
      expect(classifyOrder(order)).toBe('pending')
    })
    it('outside buffer but not invalidated', () => {
      const order: typeof BASE_ORDER = {
        ...BASE_ORDER,
        invalidated: false,
        creationDate: new Date(Date.now() - ms`10min`).toISOString(),
      }
      expect(classifyOrder(order)).toBe('pending')
    })

    // Presigned rejects
    it('open but signing method not presign', () => {
      const order: typeof BASE_ORDER = { ...BASE_ORDER, signingScheme: SigningScheme.EIP712 }
      expect(classifyOrder(order)).toBe('pending')
    })
    it('presign but not open', () => {
      const order: typeof BASE_ORDER = {
        ...BASE_ORDER,
        signingScheme: SigningScheme.PRESIGN,
        status: OrderStatus.FULFILLED,
      }
      expect(classifyOrder(order)).toBe('pending')
    })
  })
})
