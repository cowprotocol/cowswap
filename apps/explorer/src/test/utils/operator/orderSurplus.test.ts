import { OrderKind } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'
import { getOrderSurplus, ZERO_SURPLUS } from 'utils'

import { TEN_BIG_NUMBER, ZERO_BIG_NUMBER } from '../../../const'
import { RAW_ORDER } from '../../data'

const TWENTY_PERCENT = new BigNumber('0.2')
const TWENTY_FIVE_PERCENT = new BigNumber('0.25')
const TWENTY = new BigNumber('20')
const TWENTY_FIVE = new BigNumber('25')

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('getOrderSurplus', () => {
  // TODO: Break down this large function into smaller functions
  // eslint-disable-next-line max-lines-per-function
  describe('Buy order', () => {
    describe('fillOrKill', () => {
      test('No surplus', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.BUY,
          sellAmount: '100',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER })
      })
      test('No matches', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.BUY,
          sellAmount: '100',
          executedSellAmountBeforeFees: '0',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER })
      })
      test('With fees = 0', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.BUY,
          sellAmount: '100',
          executedBuyAmount: '100',
          executedSellAmountBeforeFees: '80',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TWENTY, percentage: TWENTY_FIVE_PERCENT })
      })
      test('With fees > 0', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.BUY,
          sellAmount: '100',
          executedBuyAmount: '100',
          executedSellAmountBeforeFees: '80',
          totalFee: '10',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TWENTY, percentage: TWENTY_FIVE_PERCENT })
      })
    })
    describe('partiallyFillable', () => {
      const ORDER = {
        ...RAW_ORDER,
        partiallyFillable: true,
        kind: OrderKind.BUY,
      }

      test('No matches', () => {
        const order = {
          ...ORDER,
          executedBuyAmount: '0',
          executedSellAmountBeforeFees: '0',
        }
        expect(getOrderSurplus(order)).toEqual(ZERO_SURPLUS)
      })
      test('Partial match', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '50',
          sellAmount: '100',
          executedSellAmountBeforeFees: '40',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TEN_BIG_NUMBER, percentage: TWENTY_FIVE_PERCENT })
      })
      test('Full match no surplus', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '100',
          sellAmount: '100',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual(ZERO_SURPLUS)
      })
      test('Full match with surplus', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '100',
          sellAmount: '100',
          executedSellAmountBeforeFees: '80',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TWENTY, percentage: TWENTY_FIVE_PERCENT })
      })
    })
  })

  // TODO: Break down this large function into smaller functions
  // eslint-disable-next-line max-lines-per-function
  describe('Sell order', () => {
    describe('fillOrKill', () => {
      test('No surplus', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.SELL,
          buyAmount: '100',
          executedBuyAmount: '100',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER })
      })
      test('No matches', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.SELL,
          buyAmount: '100',
          executedBuyAmount: '0',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER })
      })
      test('With fees = 0', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.SELL,
          buyAmount: '100',
          executedBuyAmount: '125',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TWENTY_FIVE, percentage: TWENTY_PERCENT })
      })
      test('With fees > 0', () => {
        const order = {
          ...RAW_ORDER,
          kind: OrderKind.SELL,
          buyAmount: '100',
          executedBuyAmount: '125',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TWENTY_FIVE, percentage: TWENTY_PERCENT })
      })
    })
    describe('partiallyFillable', () => {
      const ORDER = {
        ...RAW_ORDER,
        partiallyFillable: true,
        kind: OrderKind.SELL,
        buyAmount: '100',
        executedBuyAmount: '50',
        sellAmount: '100',
        executedSellAmountBeforeFees: '40',
      }

      test('No matches', () => {
        const order = {
          ...ORDER,
          executedBuyAmount: '0',
          executedSellAmountBeforeFees: '0',
        }
        expect(getOrderSurplus(order)).toEqual(ZERO_SURPLUS)
      })
      test('Partial match', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '50',
          sellAmount: '100',
          executedSellAmountBeforeFees: '40',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TEN_BIG_NUMBER, percentage: TWENTY_PERCENT })
      })
      test('Full match no surplus', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '100',
          sellAmount: '100',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual(ZERO_SURPLUS)
      })
      test('Full match with surplus', () => {
        const order = {
          ...ORDER,
          buyAmount: '100',
          executedBuyAmount: '125',
          sellAmount: '100',
          executedSellAmountBeforeFees: '100',
        }
        expect(getOrderSurplus(order)).toEqual({ amount: TWENTY_FIVE, percentage: TWENTY_PERCENT })
      })
    })
  })
})
