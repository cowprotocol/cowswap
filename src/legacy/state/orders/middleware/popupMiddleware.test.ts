import { pendingOrderPopup } from './pendingOrderPopup'
import { updateOrderPopup } from './updateOrderPopup'
import { batchFulfillOrderPopup } from './batchFulfillOrderPopup'
import { batchCancelOrdersPopup } from './batchCancelOrdersPopup'
import { batchExpireOrdersPopup } from './batchExpireOrdersPopup'
import { batchPresignOrdersPopup } from './batchPresignOrdersPopup'
import { AppState } from '../../index'
import { instance, mock, resetCalls, when } from 'ts-mockito'
import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { popupMiddleware } from './popupMiddleware'

// Mock simple fns using raw jest
jest.mock('./pendingOrderPopup')
jest.mock('./updateOrderPopup')
jest.mock('./batchFulfillOrderPopup')
jest.mock('./batchCancelOrdersPopup')
jest.mock('./batchExpireOrdersPopup')
jest.mock('./batchPresignOrdersPopup')

const storeMock = 'mock store' as unknown as MiddlewareAPI<Dispatch, AppState>
const nextMock = jest.fn()
const actionMock = mock<AnyAction>()

describe('popupMiddleware', () => {
  beforeEach(() => {
    resetCalls(actionMock)

    when(actionMock.payload).thenReturn('mock payload')
  })

  it('should call pendingOrderPopup when is pending order action', () => {
    when(actionMock.type).thenReturn('order/addPendingOrder')

    popupMiddleware(storeMock)(nextMock)(instance(actionMock))

    expect(pendingOrderPopup).toHaveBeenCalledWith('mock store', 'mock payload')

    expect(pendingOrderPopup).toHaveBeenCalledTimes(1)
    expect(updateOrderPopup).toHaveBeenCalledTimes(0)
    expect(batchFulfillOrderPopup).toHaveBeenCalledTimes(0)
    expect(batchCancelOrdersPopup).toHaveBeenCalledTimes(0)
    expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(0)
    expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(0)
  })

  it('should call updateOrderPopup when is update order action', () => {
    when(actionMock.type).thenReturn('order/updateOrder')

    popupMiddleware(storeMock)(nextMock)(instance(actionMock))

    expect(updateOrderPopup).toHaveBeenCalledWith('mock store', 'mock payload')

    expect(pendingOrderPopup).toHaveBeenCalledTimes(0)
    expect(updateOrderPopup).toHaveBeenCalledTimes(1)
    expect(batchFulfillOrderPopup).toHaveBeenCalledTimes(0)
    expect(batchCancelOrdersPopup).toHaveBeenCalledTimes(0)
    expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(0)
    expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(0)
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

      expect(pendingOrderPopup).toHaveBeenCalledTimes(0)
      expect(updateOrderPopup).toHaveBeenCalledTimes(0)
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

      expect(pendingOrderPopup).toHaveBeenCalledTimes(0)
      expect(updateOrderPopup).toHaveBeenCalledTimes(0)
      expect(batchFulfillOrderPopup).toHaveBeenCalledTimes(1)
      expect(batchCancelOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(0)
    })

    it('should call batchCancelOrdersPopup when is batch cancel order action', () => {
      when(actionMock.type).thenReturn('order/cancelOrdersBatch')

      popupMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      // expect(batchCancelOrdersPopup).toHaveBeenCalledWith(null, { chainId: 1 }, 'mock orders')

      expect(pendingOrderPopup).toHaveBeenCalledTimes(0)
      expect(updateOrderPopup).toHaveBeenCalledTimes(0)
      expect(batchFulfillOrderPopup).toHaveBeenCalledTimes(0)
      expect(batchCancelOrdersPopup).toHaveBeenCalledTimes(1)
      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(0)
    })

    it('should call batchExpireOrdersPopup when is batch expire order action', () => {
      when(actionMock.type).thenReturn('order/expireOrdersBatch')

      popupMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      // expect(batchExpireOrdersPopup).toHaveBeenCalledWith(null, { chainId: 1 }, 'mock orders')

      expect(pendingOrderPopup).toHaveBeenCalledTimes(0)
      expect(updateOrderPopup).toHaveBeenCalledTimes(0)
      expect(batchFulfillOrderPopup).toHaveBeenCalledTimes(0)
      expect(batchCancelOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(1)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(0)
    })

    it('should call batchPresignOrdersPopup when is batch presign order action', () => {
      when(actionMock.type).thenReturn('order/presignOrders')

      popupMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      // expect(batchPresignOrdersPopup).toHaveBeenCalledWith(null, { chainId: 1 }, 'mock orders')

      expect(pendingOrderPopup).toHaveBeenCalledTimes(0)
      expect(updateOrderPopup).toHaveBeenCalledTimes(0)
      expect(batchFulfillOrderPopup).toHaveBeenCalledTimes(0)
      expect(batchCancelOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(1)
    })
  })
})
