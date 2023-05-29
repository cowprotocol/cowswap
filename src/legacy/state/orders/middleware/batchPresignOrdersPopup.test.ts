import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { anything, capture, instance, mock, resetCalls, verify, when } from 'ts-mockito'
import { AppState } from '../../index'
import { PresignedOrdersParams } from '../actions'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { batchPresignOrdersPopup } from './batchPresignOrdersPopup'
import { setPopupData } from '../helpers'

const MOCK_REGULAR_ORDER = {
  '0x001': {
    id: '0x001',
    order: {
      summary: 'summary',
      orderClass: OrderClass.LIMIT,
    },
  },
}

const MOCK_ORDERS_STORE = {
  presignaturePending: { ...MOCK_REGULAR_ORDER },
}

const MOCK_POPUP_DATA = 'mock popup data'

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  setPopupData: jest.fn(),
}))

const setPopupDataMock = setPopupData as jest.MockedFunction<typeof setPopupData>
const storeMock = mock<MiddlewareAPI<Dispatch, AppState>>()
const payloadMock = mock<PresignedOrdersParams>()

describe('batchPresingOrdersPopup', () => {
  beforeEach(() => {
    resetCalls(storeMock)
    resetCalls(payloadMock)
    setPopupDataMock.mockReturnValue(MOCK_POPUP_DATA as any)
  })

  it('should not trigger pop up if there are no pending orders', () => {
    when(payloadMock.ids).thenReturn(['0x000'])

    batchPresignOrdersPopup(instance(storeMock), instance(payloadMock), MOCK_ORDERS_STORE as any)

    verify(storeMock.dispatch(anything())).never()
  })

  it('should trigger pop ups if there are pending orders', () => {
    when(payloadMock.ids).thenReturn(['0x001'])

    batchPresignOrdersPopup(instance(storeMock), instance(payloadMock), MOCK_ORDERS_STORE as any)

    const [addPopupAction] = capture(storeMock.dispatch<AnyAction>).first()

    expect(addPopupAction.payload).toEqual(MOCK_POPUP_DATA)

    verify(storeMock.dispatch(anything())).once()
  })
})
