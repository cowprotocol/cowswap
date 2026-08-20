import { UiOrderType } from '@cowprotocol/types'

import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { instance, mock, resetCalls, when } from 'ts-mockito'

import { getCowSoundError, getCowSoundReceiptBundle, getCowSoundSend, getCowSoundSuccess } from 'modules/sounds'

import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { soundMiddleware } from './soundMiddleware'

import { AppState } from '../../index'

const mockStore = mock<MiddlewareAPI<Dispatch, AppState>>()
const nextMock = jest.fn()
const actionMock = mock<AnyAction>()

jest.mock('modules/sounds')
jest.mock('common/utils/getIsBridgeOrder')
jest.mock('utils/orderUtils/getUiOrderType')

const getIsBridgeOrderMock = jest.mocked(getIsBridgeOrder)
const getUiOrderTypeMock = jest.mocked(getUiOrderType)
const receiptPlayMock = jest.fn().mockResolvedValue(undefined)
const successPlayMock = jest.fn().mockResolvedValue(undefined)
const otherPlayMock = jest.fn().mockResolvedValue(undefined)
const receiptSoundMock = { currentTime: 1, play: receiptPlayMock } as unknown as HTMLAudioElement
const successSoundMock = { currentTime: 1, play: successPlayMock } as unknown as HTMLAudioElement
const otherSoundMock = { currentTime: 1, play: otherPlayMock } as unknown as HTMLAudioElement

// TODO: Break down this large function into smaller functions

describe('soundMiddleware', () => {
  beforeEach(() => {
    resetCalls(actionMock)
    resetCalls(mockStore)
    when(mockStore.getState()).thenReturn({
      orders: {
        1: 'mock orders',
      },
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    jest.clearAllMocks()
    getIsBridgeOrderMock.mockReturnValue(false)
    getUiOrderTypeMock.mockReturnValue(UiOrderType.SWAP)
    receiptSoundMock.currentTime = 1
    successSoundMock.currentTime = 1
    otherSoundMock.currentTime = 1
    jest.mocked(getCowSoundReceiptBundle).mockReturnValue([successSoundMock, receiptSoundMock])
    jest.mocked(getCowSoundError).mockReturnValue(otherSoundMock)
    jest.mocked(getCowSoundSend).mockReturnValue(otherSoundMock)
    jest.mocked(getCowSoundSuccess).mockReturnValue(successSoundMock)
  })

  describe('batch order action', () => {
    it('should not play a sound when there are no orders', () => {
      when(actionMock.payload).thenReturn({ chainId: 1 })
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')
      when(mockStore.getState()).thenReturn({
        orders: {},
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })

    it('should not play a sound when there are orders but data to update for fulfill order action', () => {
      when(actionMock.payload).thenReturn({ chainId: 1, orders: [] })
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
    it('layers the success and receipt sounds for a fulfilled, non-bridge swap', () => {
      when(actionMock.payload).thenReturn({ chainId: 1, orders: [{}] })
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundReceiptBundle).toHaveBeenCalledTimes(1)
      expect(getCowSoundSuccess).toHaveBeenCalledTimes(0)
      expect(receiptSoundMock.currentTime).toBe(0)
      expect(successSoundMock.currentTime).toBe(0)
      expect(receiptPlayMock).toHaveBeenCalledTimes(1)
      expect(successPlayMock).toHaveBeenCalledTimes(1)
      expect(getCowSoundError).toHaveBeenCalledTimes(0)
      expect(getCowSoundSend).toHaveBeenCalledTimes(0)
    })

    it('keeps the existing success sound for a bridge swap leg', () => {
      getIsBridgeOrderMock.mockReturnValue(true)
      when(actionMock.payload).thenReturn({ chainId: 1, orders: [{}] })
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundReceiptBundle).toHaveBeenCalledTimes(0)
      expect(getCowSoundSuccess).toHaveBeenCalledTimes(1)
      expect(receiptPlayMock).toHaveBeenCalledTimes(0)
      expect(successPlayMock).toHaveBeenCalledTimes(1)
    })

    it('keeps the existing success sound for non-swap orders', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.LIMIT)
      when(actionMock.payload).thenReturn({ chainId: 1, orders: [{}] })
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')

      soundMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(getCowSoundReceiptBundle).toHaveBeenCalledTimes(0)
      expect(getCowSoundSuccess).toHaveBeenCalledTimes(1)
      expect(receiptPlayMock).toHaveBeenCalledTimes(0)
      expect(successPlayMock).toHaveBeenCalledTimes(1)
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
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
