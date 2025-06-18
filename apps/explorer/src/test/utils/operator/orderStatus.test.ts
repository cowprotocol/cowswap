import { OrderStatus, OrderKind } from '@cowprotocol/cow-sdk'

import { getOrderStatus } from 'utils'

import { RawOrder } from 'api/operator'

import { PENDING_ORDERS_BUFFER } from '../../../explorer/const'
import { RAW_ORDER } from '../../data'
import { mockTimes, DATE } from '../../testHelpers'

function _getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

function _getPastTimestamp(): number {
  return Math.floor(DATE.getTime() / 1000) - 1
}

function _creationDatePlusMilliseconds(milliseconds: number): Date {
  const creationDate = new Date(RAW_ORDER.creationDate)
  return new Date(creationDate.setMilliseconds(creationDate.getMilliseconds() + milliseconds))
}

// mockTimes set's Date.now() to creationDate plus twice time PendingBuffer const in the test context
beforeEach(() => mockTimes(_creationDatePlusMilliseconds(PENDING_ORDERS_BUFFER * 2)))

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('Filled status', () => {
  describe('Buy order', () => {
    test('Filled, exact amount', () => {
      const order = { ...RAW_ORDER, kind: OrderKind.BUY, buyAmount: '100', executedBuyAmount: '100' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, not yet expired', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.BUY,
        buyAmount: '100',
        executedBuyAmount: '100',
        validTo: _getCurrentTimestamp(),
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, sell amount does not affect output', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.BUY,
        buyAmount: '100',
        executedBuyAmount: '100',
        sellAmount: '100',
        executedSellAmount: '1100',
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, fee does not affect output', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.BUY,
        buyAmount: '100',
        executedBuyAmount: '100',
        sellAmount: '1000',
        executedSellAmount: '1100',
        executedFeeAmount: '100',
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
  })
  describe('Sell order', () => {
    test('Filled, exact amount', () => {
      const order = { ...RAW_ORDER, kind: OrderKind.SELL, sellAmount: '100', executedSellAmount: '100' }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, not yet expired', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '100',
        executedSellAmount: '100',
        validTo: _getCurrentTimestamp(),
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, with fee', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '90',
        executedSellAmount: '100',
        executedFeeAmount: '10',
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
    test('Filled, buy amount does not affect output', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '100',
        executedSellAmount: '100',
        buyAmount: '100',
        executedBuyAmount: '1100',
      }

      expect(getOrderStatus(order)).toEqual('filled')
    })
  })
})

describe('Expired status', () => {
  test('Buy order', () => {
    const order: RawOrder = {
      ...RAW_ORDER,
      kind: OrderKind.BUY,
      buyAmount: '10000',
    }
    expect(getOrderStatus(order)).toEqual('expired')
  })
  test('Sell order', () => {
    const order: RawOrder = {
      ...RAW_ORDER,
      kind: OrderKind.SELL,
      sellAmount: '10000',
    }
    expect(getOrderStatus(order)).toEqual('expired')
  })
  test('Expired and invalidated', () => {
    const order: RawOrder = {
      ...RAW_ORDER,
      kind: OrderKind.SELL,
      sellAmount: '10000',
      validTo: _getPastTimestamp(),
    }
    expect(getOrderStatus(order)).toEqual('expired')
  })
})

describe('Cancelling Status', () => {
  const milliseconds = 30 * 1000 // The creation time should be less than PENDING_ORDERS_BUFFER constant
  const newCurrentDate = _creationDatePlusMilliseconds(milliseconds)
  beforeEach(() => mockTimes(newCurrentDate))

  test('When creationDate is already longer than the pendingOrderBuffer', () => {
    const millisecondsBefore = -PENDING_ORDERS_BUFFER - milliseconds // ms before the newCurrentDate
    const newCreationDate = _creationDatePlusMilliseconds(millisecondsBefore)
    const order: RawOrder = {
      ...RAW_ORDER,
      kind: OrderKind.SELL,
      sellAmount: '10000',
      validTo: _getCurrentTimestamp(),
      creationDate: newCreationDate.toISOString(),
    }

    expect(getOrderStatus(order)).not.toEqual('cancelling')
  })
})

describe('Expired status', () => {
  describe('Buy order', () => {
    test('Expired', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.BUY,
        buyAmount: '10000',
        executedBuyAmount: '0',
        validTo: _getPastTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('expired')
    })
  })
  describe('Sell order', () => {
    test('Expired', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '10000',
        executedSellAmount: '0',
        validTo: _getPastTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('expired')
    })
  })
})

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('Open status', () => {
  describe('Buy order', () => {
    test('Open, no fills', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.BUY,
        buyAmount: '10000',
        executedBuyAmount: '0',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, with partial fills', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.BUY,
        buyAmount: '10000',
        executedBuyAmount: '10',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, sell amount does not affect output', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.BUY,
        buyAmount: '10000',
        executedBuyAmount: '10',
        sellAmount: '10000',
        executedSellAmount: '123',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
  })
  describe('Sell order', () => {
    test('Open, no fills', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '10000',
        executedSellAmount: '0',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, with partial fills', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '10000',
        executedSellAmount: '10',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
    test('Open, buy amount does not affect output', () => {
      const order = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        sellAmount: '10000',
        executedSellAmount: '10',
        buyAmount: '10000',
        executedBuyAmount: '323',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('open')
    })
  })
})

describe('Presignature pending status', () => {
  describe('Buy order', () => {
    test('signature is pending', () => {
      const statusFetched = OrderStatus.PRESIGNATURE_PENDING

      const order: RawOrder = {
        ...RAW_ORDER,
        kind: OrderKind.BUY,
        status: statusFetched,
        buyAmount: '10000',
        executedBuyAmount: '0',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('signing')
    })
    test('signature is not pending', () => {
      const statusFetched = OrderStatus.OPEN

      const order: RawOrder = {
        ...RAW_ORDER,
        kind: OrderKind.BUY,
        status: statusFetched,
        buyAmount: '10000',
        executedBuyAmount: '0',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).not.toEqual('signing')
    })
  })
  describe('Sell order', () => {
    test('signature is pending', () => {
      const statusFetched = OrderStatus.PRESIGNATURE_PENDING

      const order: RawOrder = {
        ...RAW_ORDER,
        kind: OrderKind.SELL,
        status: statusFetched,
        sellAmount: '10000',
        executedSellAmount: '0',
        validTo: _getCurrentTimestamp(),
      }
      expect(getOrderStatus(order)).toEqual('signing')
    })
  })
})
