import { OrderClass } from '@cowprotocol/cow-sdk'

import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { anything, capture, instance, mock, resetCalls, verify, when } from 'ts-mockito'

import { batchExpireOrdersPopup } from './batchExpireOrdersPopup'

import { AppState } from '../../index'
import { ExpireOrdersBatchParams } from '../actions'
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

const MOCK_HIDDEN_ORDER = {
  '0x003': {
    id: '0x003',
    order: {
      summary: 'summary',
      orderClass: OrderClass.LIMIT,
      isHidden: true,
    },
  },
}

const MOCK_POPUP_DATA = 'mock popup data'

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  setPopupData: jest.fn(),
}))

const setPopupDataMock = setPopupData as jest.MockedFunction<typeof setPopupData>

const MOCK_ORDERS_STORE = {
  pending: { ...MOCK_ETHFLOW_ORDER, ...MOCK_REGULAR_ORDER, ...MOCK_HIDDEN_ORDER },
}

const storeMock = mock<MiddlewareAPI<Dispatch, AppState>>()
const payloadMock = mock<ExpireOrdersBatchParams>()

describe('batchExpireOrdersPopup', () => {
  beforeEach(() => {
    resetCalls(storeMock)
    resetCalls(payloadMock)
    setPopupDataMock.mockReturnValue(MOCK_POPUP_DATA as any)
  })

  it('should not trigger pop up if there are no pending orders', () => {
    when(payloadMock.ids).thenReturn(['0x000'])

    // @ts-ignore
    batchExpireOrdersPopup(instance(storeMock), instance(payloadMock), MOCK_ORDERS_STORE)

    verify(storeMock.dispatch(anything())).never()
  })

  it('should not trigger pop up if there are no visible orders', () => {
    when(payloadMock.ids).thenReturn(['0x003'])

    // @ts-ignore
    batchExpireOrdersPopup(instance(storeMock), instance(payloadMock), MOCK_ORDERS_STORE)

    verify(storeMock.dispatch(anything())).never()
  })

  it('should trigger pop ups if there are pending orders', () => {
    when(payloadMock.ids).thenReturn(['0x001', '0x002'])

    // @ts-ignore
    batchExpireOrdersPopup(instance(storeMock), instance(payloadMock), MOCK_ORDERS_STORE)

    const [addPopupAction] = capture(storeMock.dispatch<AnyAction>).first()

    expect(addPopupAction.payload).toEqual(MOCK_POPUP_DATA)

    verify(storeMock.dispatch(anything())).twice()
  })
})
