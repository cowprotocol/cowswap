import { OrderKind } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'
import { getOrderExecutedPrice, getOrderLimitPrice, GetRawOrderPriceParams, GetOrderLimitPriceParams } from 'utils'

import { RawOrder } from 'api/operator'

import { ONE_BIG_NUMBER, ONE_HUNDRED_BIG_NUMBER, TEN_BIG_NUMBER, ZERO_BIG_NUMBER } from '../../../const'
import { RAW_ORDER } from '../../data'

const ZERO_DOT_ONE = new BigNumber('0.1')

function _assertOrderPrice(
  order: RawOrder,
  getPriceFn: (params: GetRawOrderPriceParams | GetOrderLimitPriceParams) => BigNumber
): void {
  const params =
    getPriceFn.name === 'getOrderLimitPrice' ? { buyAmount: order.buyAmount, sellAmount: order.sellAmount } : { order }

  test('Buy token decimals == sell token decimals', () => {
    expect(getPriceFn({ ...params, buyTokenDecimals: 2, sellTokenDecimals: 2 })).toEqual(TEN_BIG_NUMBER)
  })
  test('Buy token decimals < sell token decimals', () => {
    expect(getPriceFn({ ...params, buyTokenDecimals: 1, sellTokenDecimals: 2 })).toEqual(ONE_BIG_NUMBER)
  })
  test('Buy token decimals > sell token decimals', () => {
    expect(getPriceFn({ ...params, buyTokenDecimals: 2, sellTokenDecimals: 1 })).toEqual(ONE_HUNDRED_BIG_NUMBER)
  })
  test('Inverted price', () => {
    expect(getPriceFn({ ...params, buyTokenDecimals: 2, sellTokenDecimals: 2, inverted: true })).toEqual(ZERO_DOT_ONE)
  })
}

function _assertOrderPriceWithoutFills(_order: RawOrder): void {
  const order = {
    ..._order,
    executedBuyAmount: '0',
    executedSellAmount: '0',
    executedFeeAmount: '0',
    totalFee: '0',
  }
  test('Regular', () => {
    expect(getOrderExecutedPrice({ order, buyTokenDecimals: 2, sellTokenDecimals: 2 })).toEqual(ZERO_BIG_NUMBER)
  })
  test('Inverted price', () => {
    expect(getOrderExecutedPrice({ order, buyTokenDecimals: 2, sellTokenDecimals: 2, inverted: true })).toEqual(
      ZERO_BIG_NUMBER
    )
  })
}

describe('Limit price', () => {
  describe('Buy order', () => {
    const order = { ...RAW_ORDER, kind: OrderKind.BUY, buyAmount: '100', sellAmount: '1000' }

    _assertOrderPrice(order, getOrderLimitPrice)
  })

  describe('Sell order', () => {
    const order = { ...RAW_ORDER, kind: OrderKind.SELL, buyAmount: '100', sellAmount: '1000' }

    _assertOrderPrice(order, getOrderLimitPrice)
  })
})

describe('Executed price', () => {
  describe('Buy order', () => {
    const order = {
      ...RAW_ORDER,
      kind: OrderKind.BUY,
      executedBuyAmount: '100',
      executedSellAmountBeforeFees: '1000',
    }
    describe('With fills', () => {
      _assertOrderPrice(order, getOrderExecutedPrice)
    })
    describe('Without fills', () => {
      _assertOrderPriceWithoutFills(order)
    })
  })

  describe('Sell order', () => {
    const order = {
      ...RAW_ORDER,
      kind: OrderKind.SELL,
      executedBuyAmount: '100',
      executedSellAmountBeforeFees: '1000',
    }

    describe('With fills', () => {
      _assertOrderPrice(order, getOrderExecutedPrice)
    })
    describe('Without fills', () => {
      _assertOrderPriceWithoutFills(order)
    })
  })
})
