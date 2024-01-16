import { getCowSoundError, getCowSoundSend, getCowSoundSuccess } from '@cowprotocol/common-utils'

import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { instance, mock, resetCalls, when } from 'ts-mockito'

import { soundMiddleware } from './soundMiddleware'

import { AppState } from '../../index'

const mockStore = mock<MiddlewareAPI<Dispatch, AppState>>()
const nextMock = jest.fn()
const actionMock = mock<AnyAction>()

jest.mock('@cowprotocol/common-utils')

describe('soundMiddleware', () => {
  beforeEach(() => {
    resetCalls(actionMock)
    resetCalls(mockStore)
    when(mockStore.getState()).thenReturn({
      orders: {
        1: 'mock orders',
      },
    } as any)
    jest.clearAllMocks()
  })

  describe('batch order action', () => {
    it('should not play a sound when there are no orders', () => {
      when(actionMock.payload).thenReturn({ chainId: 1 })
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')
      when(mockStore.getState()).thenReturn({
        orders: {},
      } as any)

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })

    it('should not play a sound when there are orders but data to update for fulfill order action', () => {
      when(actionMock.payload).thenReturn({ chainId: 1, ordersData: [] })
      when(actionMock.type).thenReturn('order/fulfillOrder')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })

    it('should not play a sound when there are orders but data to update for batch expire order action', () => {
      when(actionMock.payload).thenReturn({ chainId: 1, ids: [] })
      when(actionMock.type).thenReturn('order/expireOrdersBatch')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })
  })
  describe('pending order action', () => {
    it('should play a sound when order is not hidden', () => {
      when(actionMock.payload).thenReturn({ chainId: 1, order: { isHidden: false } })
      when(actionMock.type).thenReturn('order/addPendingOrder')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(1)
    })

    it('should not play a sound when order is hidden', () => {
      when(actionMock.payload).thenReturn({ chainId: 1, order: { isHidden: true } })
      when(actionMock.type).thenReturn('order/addPendingOrder')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })
  })
  describe('fulfill order action', () => {
    it('should play a sound', () => {
      when(actionMock.payload).thenReturn({ chainId: 1, ordersData: ['some data'] })
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(1)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })
  })
  describe('batch expire order action', () => {
    it('should play a sound when order is not hidden', () => {
      when(actionMock.payload).thenReturn({ chainId: 1, ids: ['0x1'] })
      when(actionMock.type).thenReturn('order/expireOrdersBatch')
      when(mockStore.getState()).thenReturn({
        orders: {
          1: {
            pending: {
              '0x1': {
                order: {
                  id: '0x1',
                  isHidden: false,
                },
              },
            },
          },
        },
      } as any)

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(1)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })

    it('should not play a sound when order is hidden', () => {
      when(actionMock.payload).thenReturn({ chainId: 1, ids: ['0x1'] })
      when(actionMock.type).thenReturn('order/expireOrdersBatch')
      when(mockStore.getState()).thenReturn({
        orders: {
          1: {
            pending: {
              '0x1': {
                order: {
                  id: '0x1',
                  isHidden: true,
                },
              },
            },
          },
        },
      } as any)

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })
  })
  describe('batch cancel order action', () => {
    it('should play a sound when order is not hidden', () => {
      when(actionMock.payload).thenReturn({ chainId: 1, ids: ['0x1'] })
      when(actionMock.type).thenReturn('order/cancelOrdersBatch')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(1)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })

    it('should not play a sound when order is hidden', () => {
      when(actionMock.payload).thenReturn({ chainId: 1, ids: ['0x1'] })
    })
  })
  describe('failed tx action', () => {
    it('should play a sound when tx failed', () => {
      when(actionMock.payload).thenReturn({ content: { txn: { success: false } } })
      when(actionMock.type).thenReturn('application/addPopup')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(1)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })

    it('should not play a sound when tx is successful', () => {
      when(actionMock.payload).thenReturn({ content: { txn: { success: true } } })
      when(actionMock.type).thenReturn('application/addPopup')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })

    it('should not play a sound when tx content is not defined', () => {
      when(actionMock.payload).thenReturn({ content: {} })
      when(actionMock.type).thenReturn('application/addPopup')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })
  })
  describe('update order action', () => {
    it('should play a sound when order is not hidden', () => {
      when(actionMock.payload).thenReturn({ order: { isHidden: false } })
      when(actionMock.type).thenReturn('order/updateOrder')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(1)
    })

    it('should not play a sound when order is hidden', () => {
      when(actionMock.payload).thenReturn({ order: { isHidden: true } })
      when(actionMock.type).thenReturn('order/updateOrder')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })
  })
})
