import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { anything, capture, instance, mock, resetCalls, verify, when } from 'ts-mockito'
import { AppState } from '../../index'
import { PresignedOrdersParams } from '../actions'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { batchPresignOrdersPopup } from './batchPresignOrdersPopup'

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

const storeMock = mock<MiddlewareAPI<Dispatch, AppState>>()
const payloadMock = mock<PresignedOrdersParams>()

describe('batchPresingOrdersPopup', () => {
  beforeEach(() => {
    resetCalls(storeMock)
    resetCalls(payloadMock)
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

    expect(addPopupAction).toMatchSnapshot()

    verify(storeMock.dispatch(anything())).once()
  })
})
