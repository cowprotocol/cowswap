import { OrderKind } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'
import { getOrderFilledAmount } from 'utils'

import { ONE_BIG_NUMBER, ONE_HUNDRED_BIG_NUMBER, TEN_BIG_NUMBER, ZERO_BIG_NUMBER } from '../../../const'
import { RAW_ORDER } from '../../../test/data'

const TEN_PERCENT = new BigNumber('0.1')
const ONE_HUNDRED_PERCENT = ONE_BIG_NUMBER

describe('Order not filled', () => {
  describe('Buy order', () => {
    test('0% filled', () => {
      const order = { ...RAW_ORDER, kind: OrderKind.BUY, buyAmount: '100', executedBuyAmount: '0' }

      expect(getOrderFilledAmount(order)).toEqual({ amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER })
    })
  })
  describe('Sell order', () => {
    test('0% filled', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '100',
        executedSellAmount: '0',
        executedFeeAmount: '0',
      }

      expect(getOrderFilledAmount(order)).toEqual({ amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER })
    })
  })
})

describe('Order partially filled', () => {
  describe('Buy order', () => {
    test('10% filled', () => {
      const order = { ...RAW_ORDER, kind: OrderKind.BUY, buyAmount: '100', executedBuyAmount: '10' }

      expect(getOrderFilledAmount(order)).toEqual({ amount: TEN_BIG_NUMBER, percentage: TEN_PERCENT })
    })
  })
  describe('Sell order', () => {
    test('10% filled, without fee', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '100',
        executedSellAmount: '10',
        executedFeeAmount: '0',
      }

      expect(getOrderFilledAmount(order)).toEqual({ amount: TEN_BIG_NUMBER, percentage: TEN_PERCENT })
    })
    test('10% filled, with fee', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '100',
        executedSellAmount: '11',
        executedFeeAmount: '1',
      }

      expect(getOrderFilledAmount(order)).toEqual({ amount: TEN_BIG_NUMBER, percentage: TEN_PERCENT })
    })
  })
})

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('Order filled', () => {
  describe('Buy order', () => {
    test('100% filled, no surplus', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.BUY,
        buyAmount: '100',
        executedBuyAmount: '100',
        sellAmount: '100',
        executedSellAmount: '100',
      }

      expect(getOrderFilledAmount(order)).toEqual({ amount: ONE_HUNDRED_BIG_NUMBER, percentage: ONE_HUNDRED_PERCENT })
    })
    test('100% filled, with surplus', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.BUY,
        buyAmount: '100',
        executedBuyAmount: '100',
        sellAmount: '100',
        executedSellAmount: '90', // sold less for the same buy amount
      }

      expect(getOrderFilledAmount(order)).toEqual({ amount: ONE_HUNDRED_BIG_NUMBER, percentage: ONE_HUNDRED_PERCENT })
    })
  })
  describe('Sell order', () => {
    test('100% filled, no surplus, no fee', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '100',
        executedSellAmount: '100',
        executedFeeAmount: '0',
        buyAmount: '100',
        executedBuyAmount: '100',
      }

      expect(getOrderFilledAmount(order)).toEqual({ amount: ONE_HUNDRED_BIG_NUMBER, percentage: ONE_HUNDRED_PERCENT })
    })
    test('100% filled, with fee', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '100',
        executedSellAmount: '110',
        executedFeeAmount: '10',
        buyAmount: '100',
        executedBuyAmount: '100',
      }

      expect(getOrderFilledAmount(order)).toEqual({ amount: ONE_HUNDRED_BIG_NUMBER, percentage: ONE_HUNDRED_PERCENT })
    })
    test('100% filled, with surplus', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '100',
        executedSellAmount: '100',
        executedFeeAmount: '0',
        buyAmount: '100',
        executedBuyAmount: '110', // bought more for the same sell amount
      }

      expect(getOrderFilledAmount(order)).toEqual({ amount: ONE_HUNDRED_BIG_NUMBER, percentage: ONE_HUNDRED_PERCENT })
    })
  })
})
