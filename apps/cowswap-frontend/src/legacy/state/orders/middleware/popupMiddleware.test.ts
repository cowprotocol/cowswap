import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { instance, mock, resetCalls, when } from 'ts-mockito'

import { batchExpireOrdersPopup } from './batchExpireOrdersPopup'
import { batchPresignOrdersPopup } from './batchPresignOrdersPopup'
import { popupMiddleware } from './popupMiddleware'

import { AppState } from '../../index'

// Mock simple fns using raw jest
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

      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(0)
    })

    it('should call batchExpireOrdersPopup when is batch expire order action', () => {
      when(actionMock.type).thenReturn('order/expireOrdersBatch')

      popupMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      // expect(batchExpireOrdersPopup).toHaveBeenCalledWith(null, { chainId: 1 }, 'mock orders')

      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(1)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(0)
    })

    it('should call batchPresignOrdersPopup when is batch presign order action', () => {
      when(actionMock.type).thenReturn('order/presignOrders')

      popupMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      // expect(batchPresignOrdersPopup).toHaveBeenCalledWith(null, { chainId: 1 }, 'mock orders')

      expect(batchExpireOrdersPopup).toHaveBeenCalledTimes(0)
      expect(batchPresignOrdersPopup).toHaveBeenCalledTimes(1)
    })
  })
})
