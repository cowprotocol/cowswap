import { OrderClass } from '@cowprotocol/cow-sdk'

import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { anything, capture, instance, mock, resetCalls, verify, when } from 'ts-mockito'

import { batchFulfillOrderPopup } from './batchFulfillOrderPopup'

import { AppState } from '../../index'
import { FulfillOrdersBatchParams } from '../actions'
import { setPopupData } from '../helpers'

const MOCK_ETHFLOW_ORDER = {
  '0x001': {
    id: '0x001',
    order: {
      summary: 'summary',
      orderClass: OrderClass.MARKET,
      orderCreationHash: '0xhash',
    },
  },
}

const MOCK_REGULAR_ORDER = {
  '0x002': {
    id: '0x002',
    order: {
      summary: 'summary',
      orderClass: OrderClass.LIMIT,
    },
  },
}

const MOCK_ORDERS_STORE = {
  pending: { ...MOCK_ETHFLOW_ORDER, ...MOCK_REGULAR_ORDER },
}

const MOCK_POPUP_DATA = 'mock popup data'

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  setPopupData: jest.fn(),
}))

const setPopupDataMock = setPopupData as jest.MockedFunction<typeof setPopupData>
const storeMock = mock<MiddlewareAPI<Dispatch, AppState>>()
const payloadMock = mock<FulfillOrdersBatchParams>()

const BASE_PAYLOAD = { fulfillmentTime: '', transactionHash: '' }

describe('batchFulfillOrderPopup', () => {
  beforeEach(() => {
    resetCalls(storeMock)
    resetCalls(payloadMock)
    setPopupDataMock.mockReturnValue(MOCK_POPUP_DATA as any)
  })

  it('should not trigger pop up if there are no pending orders', () => {
    when(payloadMock.ordersData).thenReturn([{ id: '0x000', ...BASE_PAYLOAD }])

    batchFulfillOrderPopup(instance(storeMock), instance(payloadMock), MOCK_ORDERS_STORE as any)

    verify(storeMock.dispatch(anything())).never()
  })

  it('should trigger pop ups if there are pending orders', () => {
    when(payloadMock.ordersData).thenReturn([
      { id: '0x001', ...BASE_PAYLOAD },
      { id: '0x002', ...BASE_PAYLOAD },
    ])

    batchFulfillOrderPopup(instance(storeMock), instance(payloadMock), MOCK_ORDERS_STORE as any)

    const [addPopupAction] = capture(storeMock.dispatch<AnyAction>).first()

    expect(addPopupAction.payload).toEqual(MOCK_POPUP_DATA)

    verify(storeMock.dispatch(anything())).twice()
  })
})
