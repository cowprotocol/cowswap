import { instance, mock, resetCalls, when } from 'ts-mockito'
import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { isOrderInPendingTooLong, openNpsAppziSometimes } from 'legacy/utils/appzi'
import { AppState } from '../../index'
import { appziMiddleware } from './appziMiddleware'
import { OrderClass } from '@cowprotocol/cow-sdk'

jest.mock('legacy/utils/appzi')

const isOrderInPendingTooLongMock = jest.mocked(isOrderInPendingTooLong)
const openNpsAppziSometimesMock = jest.mocked(openNpsAppziSometimes)

const mockStore = mock<MiddlewareAPI<Dispatch, AppState>>()
const nextMock = jest.fn()
const actionMock = mock<AnyAction>()

describe('appziMiddleware', () => {
  beforeEach(() => {
    resetCalls(actionMock)
    resetCalls(mockStore)
  })

  describe('batch fulfill', () => {
    beforeEach(() => {
      when(actionMock.payload).thenReturn({ chainId: 1, ordersData: [{ id: '0x1' }] })
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')
    })

    it('should open appzi if market order', () => {
      when(mockStore.getState()).thenReturn({
        orders: {
          1: {
            pending: {
              '0x1': {
                order: {
                  id: '0x1',
                  class: OrderClass.MARKET,
                },
              },
            },
          },
        },
      } as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })

    it('should not open appzi if limit order is pending too long', () => {
      isOrderInPendingTooLongMock.mockReturnValue(true)
      when(mockStore.getState()).thenReturn({
        orders: {
          1: {
            pending: {
              '0x1': {
                order: {
                  id: '0x1',
                  class: OrderClass.LIMIT,
                },
              },
            },
          },
        },
      } as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })
    it('should open appzi if limit order is not pending too long', () => {
      isOrderInPendingTooLongMock.mockReturnValue(false)
      when(mockStore.getState()).thenReturn({
        orders: {
          1: {
            pending: {
              '0x1': {
                order: {
                  id: '0x1',
                  class: OrderClass.LIMIT,
                },
              },
            },
          },
        },
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
      when(mockStore.getState()).thenReturn({
        orders: {
          1: {
            pending: {
              '0x1': {
                order: {
                  id: '0x1',
                  class: OrderClass.MARKET,
                },
              },
            },
          },
        },
      } as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })

    it('should open appzi if limit order', () => {
      when(mockStore.getState()).thenReturn({
        orders: {
          1: {
            pending: {
              '0x1': {
                order: {
                  id: '0x1',
                  class: OrderClass.LIMIT,
                },
              },
            },
          },
        },
      } as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })
  })
})
