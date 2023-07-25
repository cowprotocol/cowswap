import { AnyAction, Dispatch, MiddlewareAPI } from 'redux'
import { anything, capture, instance, mock, resetCalls, verify } from 'ts-mockito'

import { batchCancelOrdersPopup } from './batchCancelOrdersPopup'

import { AppState } from '../../index'
import { setPopupData } from '../helpers'

const MOCK_ORDERS = [{ id: '0x001' }, { id: '0x002' }]

const MOCK_POPUP_DATA = 'mock popup data'

jest.mock('../helpers', () => ({
  ...jest.requireActual('../helpers'),
  setPopupData: jest.fn(),
}))

const setPopupDataMock = setPopupData as jest.MockedFunction<typeof setPopupData>
const storeMock = mock<MiddlewareAPI<Dispatch, AppState>>()

describe('batchCancelOrdersPopup', () => {
  beforeEach(() => {
    resetCalls(storeMock)
    setPopupDataMock.mockReturnValue(MOCK_POPUP_DATA as any)
  })

  it('should trigger pop ups for pending orders', () => {
    // @ts-ignore
    batchCancelOrdersPopup(instance(storeMock), MOCK_ORDERS)

    const [addPopupAction] = capture(storeMock.dispatch<AnyAction>).first()

    expect(addPopupAction.payload).toEqual(MOCK_POPUP_DATA)

    verify(storeMock.dispatch(anything())).twice()
  })
})
