import { isOrderInPendingTooLong, triggerAppziSurvey } from '@cowprotocol/common-utils'
import { UiOrderType } from '@cowprotocol/types'

import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { instance, mock, resetCalls, when } from 'ts-mockito'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { appziMiddleware } from './appziMiddleware'

import { AppState } from '../../index'
import { getOrderByIdFromState } from '../helpers'

jest.mock('@cowprotocol/common-utils')
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

describe('appziMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()

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
      when(actionMock.payload).thenReturn({ chainId: 1, orders: [BASE_ORDER.order] })
      when(actionMock.type).thenReturn('order/fullfillOrdersBatch')
      getUiOrderTypeMock.mockReturnValue(UiOrderType.SWAP)
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
      } as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })
  })
  describe('batch expire', () => {
    beforeEach(() => {
      when(actionMock.payload).thenReturn({ chainId: 1, ids: [BASE_ORDER.order.id] })
      when(actionMock.type).thenReturn('order/expireOrdersBatch')
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
      } as any)

      appziMiddleware(instance(mockStore))(nextMock)(instance(actionMock))

      expect(openNpsAppziSometimesMock).not.toHaveBeenCalled()
    })

    it('should not open appzi if limit order is hidden', () => {
      getOrderByOrderIdFromStateMock.mockReturnValue({
        order: { ...BASE_ORDER.order, isHidden: true },
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
