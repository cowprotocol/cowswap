import { UiOrderType } from '@cowprotocol/types'

import { isOrderInPendingTooLong, triggerAppziSurvey } from 'appzi'
import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { instance, mock, resetCalls, when } from 'ts-mockito'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { appziMiddleware } from './appziMiddleware'

import { AppState } from '../../index'
import { getOrderByIdFromState } from '../helpers'

jest.mock('appzi')
jest.mock('../helpers', () => {
  return {
    ...jest.requireActual('../helpers'),
    getOrderByIdFromState: jest.fn(),
  }
})
jest.mock('utils/orderUtils/getUiOrderType', () => {
  return {
    ...jest.requireActual('utils/orderUtils/getUiOrderType'),
    getUiOrderType: jest.fn(),
  }
})

const isOrderInPendingTooLongMock = jest.mocked(isOrderInPendingTooLong)
const openNpsAppziSometimesMock = jest.mocked(triggerAppziSurvey)
const getOrderByOrderIdFromStateMock = jest.mocked(getOrderByIdFromState)
const getUiOrderTypeMock = jest.mocked(getUiOrderType)

const mockStore = mock<MiddlewareAPI<Dispatch, AppState>>()
const nextMock = jest.fn()
const actionMock = mock<AnyAction>()

const BASE_ORDER = {
  order: {
    id: '0x1',
  },
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('appziMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    resetCalls(actionMock)
    resetCalls(mockStore)
    when(mockStore.getState()).thenReturn({
      orders: {
        1: 'mocked orders',
      },
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  describe('batch fulfill', () => {
    beforeEach(() => {
      when(actionMock.payload).thenReturn({ chainId: 1, orders: [BASE_ORDER.order] })
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')
      getUiOrderTypeMock.mockReturnValue(UiOrderType.SWAP)
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getOrderByOrderIdFromStateMock.mockReturnValue(BASE_ORDER as any)
    })

    it('should open appzi if market order', () => {
      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })

    it('should not open appzi if limit order is pending too long', () => {
      isOrderInPendingTooLongMock.mockReturnValue(true)
      getUiOrderTypeMock.mockReturnValue(UiOrderType.LIMIT)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })
    it('should open appzi if limit order is not pending too long', () => {
      isOrderInPendingTooLongMock.mockReturnValue(false)
      getUiOrderTypeMock.mockReturnValue(UiOrderType.LIMIT)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })

    it('should not open appzi if order is hidden', () => {
      getOrderByOrderIdFromStateMock.mockReturnValue({
        order: { ...BASE_ORDER.order, isHidden: true },
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })
  })
  describe('batch expire', () => {
    beforeEach(() => {
      when(actionMock.payload).thenReturn({ chainId: 1, ids: [BASE_ORDER.order.id] })
      when(actionMock.type).thenReturn('order/expireOrdersBatch')
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getOrderByOrderIdFromStateMock.mockReturnValue(BASE_ORDER as any)
      getUiOrderTypeMock.mockReturnValue(UiOrderType.SWAP)
    })

    it('should open appzi if market order', () => {
      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })

    it('should open appzi if limit order', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.LIMIT)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })

    it('should not open appzi if market order is hidden', () => {
      getOrderByOrderIdFromStateMock.mockReturnValue({
        order: { ...BASE_ORDER.order, isHidden: true },
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })

    it('should not open appzi if limit order is hidden', () => {
      getOrderByOrderIdFromStateMock.mockReturnValue({
        order: { ...BASE_ORDER.order, isHidden: true },
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      getUiOrderTypeMock.mockReturnValue(UiOrderType.LIMIT)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })
  })
  describe('batch presign', () => {
    beforeEach(() => {
      when(actionMock.payload).thenReturn({ chainId: 1, ids: [BASE_ORDER.order.id] })
      when(actionMock.type).thenReturn('order/presignOrders')

      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getOrderByOrderIdFromStateMock.mockReturnValue(BASE_ORDER as any)
    })

    it('should not open appzi when SWAP', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.SWAP)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })

    it('should not open appzi when TWAP', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.TWAP)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })

    it('should open appzi when LIMIT', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.LIMIT)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })
  })
  describe('add pending order', () => {
    beforeEach(() => {
      when(actionMock.payload).thenReturn({ chainId: 1, ...BASE_ORDER })
      when(actionMock.type).thenReturn('order/addPendingOrder')

      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getOrderByOrderIdFromStateMock.mockReturnValue(BASE_ORDER as any)
    })

    it('should not open appzi when SWAP', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.SWAP)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })

    it('should not open appzi when TWAP', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.TWAP)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })

    it('should open appzi when LIMIT', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.LIMIT)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })

    it('should not open appzi when LIMIT is hidden', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.LIMIT)
      when(actionMock.payload).thenReturn({
        chainId: 1,
        ...{
          order: { ...BASE_ORDER.order, isHidden: true },
        },
      })

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(0)
    })
  })
  describe('batch cancel orders', () => {
    beforeEach(() => {
      when(actionMock.payload).thenReturn({ chainId: 1, ids: [BASE_ORDER.order.id] })
      when(actionMock.type).thenReturn('order/cancelOrdersBatch')

      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getOrderByOrderIdFromStateMock.mockReturnValue(BASE_ORDER as any)
    })

    it('should not open appzi when SWAP', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.SWAP)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })

    it('should not open appzi when TWAP', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.TWAP)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })

    it('should open appzi when LIMIT', () => {
      getUiOrderTypeMock.mockReturnValue(UiOrderType.LIMIT)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).toHaveBeenCalledTimes(1)
    })
  })
})
