import { MiddlewareAPI } from '@reduxjs/toolkit'
import { AnyAction, Dispatch } from 'redux'
import { AppState } from '../../index'
import { UpdateOrderParams } from '../actions'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { anything, capture, instance, mock, resetCalls, verify, when } from 'ts-mockito'
import { updateOrderPopup } from './updateOrderPopup'
import { setPopupData } from '../helpers'

const MOCK_ORDERS_STORE = {
  1: {
    pending: {
      '0x001': {
        id: '0x001',
        order: {
          summary: 'summary',
          orderClass: OrderClass.LIMIT,
        },
      },
    },
  },
}

const MOCK_POPUP_DATA = 'mock popup data'

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  setPopupData: jest.fn(),
}))

const setPopupDataMock = setPopupData as jest.MockedFunction<typeof setPopupData>

const storeMock = mock<MiddlewareAPI<Dispatch, AppState>>()
const payloadMock = mock<UpdateOrderParams>()

describe('updateOrderPopup', () => {
  when(storeMock.getState()).thenReturn({ orders: MOCK_ORDERS_STORE } as any)
  when(payloadMock.chainId).thenReturn(1)

  beforeEach(() => {
    resetCalls(storeMock)
    resetCalls(payloadMock)
    setPopupDataMock.mockReturnValue(MOCK_POPUP_DATA as any)
  })

  it('should not trigger pop up for inexistent order', () => {
    when(payloadMock.order).thenReturn({ id: '0x000' } as any)

    updateOrderPopup(instance(storeMock), instance(payloadMock))

    verify(storeMock.dispatch(anything())).never()
  })
  it('should not trigger pop up for hidden order', () => {
    when(payloadMock.order).thenReturn({ id: '0x001', isHidden: true } as any)

    updateOrderPopup(instance(storeMock), instance(payloadMock))

    verify(storeMock.dispatch(anything())).never()
  })
  it('should trigger pop up for visible order', () => {
    when(payloadMock.order).thenReturn({ id: '0x001', isHidden: false } as any)

    updateOrderPopup(instance(storeMock), instance(payloadMock))

    const [addPopupAction] = capture(storeMock.dispatch<AnyAction>).first()

    expect(addPopupAction.payload).toEqual(MOCK_POPUP_DATA)
  })
})
