import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { instance, mock, resetCalls, when } from 'ts-mockito'

import { batchCancelOrdersPopup } from './batchCancelOrdersPopup'
import { batchExpireOrdersPopup } from './batchExpireOrdersPopup'
import { batchFulfillOrderPopup } from './batchFulfillOrderPopup'
import { batchPresignOrdersPopup } from './batchPresignOrdersPopup'
import { popupMiddleware } from './popupMiddleware'

import { AppState } from '../../index'

// Mock simple fns using raw jest
jest.mock('./batchFulfillOrderPopup')
jest.mock('./batchCancelOrdersPopup')
jest.mock('./batchExpireOrdersPopup')
jest.mock('./batchPresignOrdersPopup')

const nextMock = jest.fn()
const actionMock = mock<AnyAction>()

describe('popupMiddleware', () => {
  beforeEach(() => {
    resetCalls(actionMock)
    jest.clearAllMocks()

    when(actionMock.payload).thenReturn('mock payload')
  })

  describe('batch actions', () => {
    const mockStore = mock<MiddlewareAPI<Dispatch, AppState>>()

    beforeEach(() => {
      when(actionMock.payload).thenReturn({ chainId: 1 })
      when(mockStore.getState()).thenReturn({
        orders: {
          1: 'mock orders',
        },
      } as any)
    })

    it('should return when there are no orders', () => {
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')
      when(mockStore.getState()).thenReturn({
        orders: {},
      } as any)

      popupMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(batchFulfillOrderPopup).toHaveBeenCalledTimes(0)
      expect(batchCancelOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(0)
    })

    it('should call batchFulfillOrderPopup when is batch fulfill order action', () => {
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')

      popupMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      // TODO: can't get this to work, mockStore is never matched
      // expect(batchFulfillOrderPopup).toHaveBeenCalledWith(null, { chainId: 1 }, 'mock orders')

      expect(batchFulfillOrderPopup).toHaveBeenCalledTimes(1)
      expect(batchCancelOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(0)
    })

    it('should call batchCancelOrdersPopup when is batch cancel order action', () => {
      when(actionMock.type).thenReturn('order/cancelOrdersBatch')
      when(actionMock.payload).thenReturn({ chainId: 1, ids: [1] })

      popupMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      // expect(batchCancelOrdersPopup).toHaveBeenCalledWith(null, { chainId: 1 }, 'mock orders')

      expect(batchFulfillOrderPopup).toHaveBeenCalledTimes(0)
      expect(batchCancelOrdersPopup).toHaveBeenCalledTimes(1)
      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(0)
    })

    it('should call batchExpireOrdersPopup when is batch expire order action', () => {
      when(actionMock.type).thenReturn('order/expireOrdersBatch')

      popupMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      // expect(batchExpireOrdersPopup).toHaveBeenCalledWith(null, { chainId: 1 }, 'mock orders')

      expect(batchFulfillOrderPopup).toHaveBeenCalledTimes(0)
      expect(batchCancelOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(1)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(0)
    })

    it('should call batchPresignOrdersPopup when is batch presign order action', () => {
      when(actionMock.type).thenReturn('order/presignOrders')

      popupMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      // expect(batchPresignOrdersPopup).toHaveBeenCalledWith(null, { chainId: 1 }, 'mock orders')

      expect(batchFulfillOrderPopup).toHaveBeenCalledTimes(0)
      expect(batchCancelOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(1)
    })
  })
})
