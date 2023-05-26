import { pendingOrderPopup } from './pendingOrderPopup'
import { MiddlewareAPI } from '@reduxjs/toolkit'
import { AnyAction, Dispatch } from 'redux'
import { AppState } from '../../index'
import { AddPendingOrderParams } from '../actions'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { anything, capture, instance, mock, resetCalls, verify, when } from 'ts-mockito'
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
  1: {
    pending: { ...MOCK_ETHFLOW_ORDER, ...MOCK_REGULAR_ORDER },
  },
}

const MOCK_POPUP_DATA = 'mock popup data'

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  setPopupData: jest.fn(),
}))

const setPopupDataMock = setPopupData as jest.MockedFunction<typeof setPopupData>

const storeMock = mock<MiddlewareAPI<Dispatch, AppState>>()
const payloadMock = mock<AddPendingOrderParams>()

describe('pendingOrderPopup', () => {
  when(storeMock.getState()).thenReturn({ orders: MOCK_ORDERS_STORE } as any)
  when(payloadMock.chainId).thenReturn(1)

  beforeEach(() => {
    resetCalls(storeMock)
    resetCalls(payloadMock)
    setPopupDataMock.mockReturnValue(MOCK_POPUP_DATA as any)
  })

  it('should not trigger pop up for inexistent order', () => {
    when(payloadMock.id).thenReturn('0x000')

    pendingOrderPopup(instance(storeMock), instance(payloadMock))

    verify(storeMock.dispatch(anything())).never()
  })

  it('should trigger pop up for ethflow order', () => {
    when(payloadMock.id).thenReturn('0x001')

    pendingOrderPopup(instance(storeMock), instance(payloadMock))

    const [addPopupAction] = capture(storeMock.dispatch<AnyAction>).first()

    expect(addPopupAction.payload).toEqual(MOCK_POPUP_DATA)
  })

  it('should trigger pop up for regular order', () => {
    when(payloadMock.id).thenReturn('0x002')
    // @ts-ignore
    when(payloadMock.order).thenReturn({ isHidden: false })

    pendingOrderPopup(instance(storeMock), instance(payloadMock))

    const [addPopupAction] = capture(storeMock.dispatch<AnyAction>).first()

    expect(addPopupAction.payload).toEqual(MOCK_POPUP_DATA)
  })

  it('should not trigger pop up for hidden order', () => {
    when(payloadMock.id).thenReturn('0x003')
    // @ts-ignore
    when(payloadMock.order).thenReturn({ isHidden: true })

    pendingOrderPopup(instance(storeMock), instance(payloadMock))

    verify(storeMock.dispatch(anything())).never()
  })
})
