import { OrderClass } from '@cowprotocol/cow-sdk'
import { getOrderByIdFromState } from '../helpers'

import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { instance, mock, resetCalls, when } from 'ts-mockito'

import { isOrderInPendingTooLong, openNpsAppziSometimes } from 'legacy/utils/appzi'

import { appziMiddleware } from './appziMiddleware'

import { AppState } from '../../index'

jest.mock('legacy/utils/appzi')
jest.mock('../helpers', () => {
  return {
    ...jest.requireActual('../helpers'),
    getOrderByIdFromState: jest.fn(),
  }
})

const isOrderInPendingTooLongMock = jest.mocked(isOrderInPendingTooLong)
const openNpsAppziSometimesMock = jest.mocked(openNpsAppziSometimes)
const getOrderByOrderIdFromStateMock = jest.mocked(getOrderByIdFromState)

const mockStore = mock<MiddlewareAPI<Dispatch, AppState>>()
const nextMock = jest.fn()
const actionMock = mock<AnyAction>()

const BASE_MARKET_ORDER = {
  order: {
    id: '0x1',
    class: OrderClass.MARKET,
  },
}

const BASE_LIMIT_ORDER = {
  order: {
    id: '0x1',
    class: OrderClass.LIMIT,
  },
}

describe('appziMiddleware', () => {
  beforeEach(() => {
    resetCalls(actionMock)
    resetCalls(mockStore)
    when(mockStore.getState()).thenReturn({
      orders: {
        1: 'mocked orders',
      },
    } as any)
  })

  describe('batch fulfill', () => {
    beforeEach(() => {
      when(actionMock.payload).thenReturn({ chainId: 1, ordersData: [{ id: '0x1' }] })
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')
    })

    it('should open appzi if market order', () => {
      getOrderByOrderIdFromStateMock.mockReturnValue(BASE_MARKET_ORDER as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })

    it('should not open appzi if limit order is pending too long', () => {
      isOrderInPendingTooLongMock.mockReturnValue(true)
      getOrderByOrderIdFromStateMock.mockReturnValue(BASE_LIMIT_ORDER as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })
    it('should open appzi if limit order is not pending too long', () => {
      isOrderInPendingTooLongMock.mockReturnValue(false)
      getOrderByOrderIdFromStateMock.mockReturnValue(BASE_LIMIT_ORDER as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })

    it('should open appzi if order is hidden', () => {
      getOrderByOrderIdFromStateMock.mockReturnValue({
        order: { ...BASE_MARKET_ORDER.order, isHidden: true },
      } as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })
  })
  describe('batch expire', () => {
    beforeEach(() => {
      when(actionMock.payload).thenReturn({ chainId: 1, ids: ['0x1'] })
      when(actionMock.type).thenReturn('order/expireOrdersBatch')
    })

    it('should open appzi if market order', () => {
      getOrderByOrderIdFromStateMock.mockReturnValue(BASE_MARKET_ORDER as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })

    it('should open appzi if limit order', () => {
      getOrderByOrderIdFromStateMock.mockReturnValue(BASE_LIMIT_ORDER as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })

    it('should not open appzi if market order is hidden', () => {
      getOrderByOrderIdFromStateMock.mockReturnValue({
        order: { ...BASE_MARKET_ORDER.order, isHidden: true },
      } as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })

    it('should not open appzi if limit order is hidden', () => {
      getOrderByOrderIdFromStateMock.mockReturnValue({
        order: { ...BASE_LIMIT_ORDER.order, isHidden: true },
      } as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })
  })
})
