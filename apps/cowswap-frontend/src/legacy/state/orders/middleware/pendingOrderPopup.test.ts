import { OrderClass } from '@cowprotocol/cow-sdk'

import { MiddlewareAPI } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
import { anything, instance, mock, resetCalls, verify, when } from 'ts-mockito'

import { pendingOrderPopup } from './pendingOrderPopup'
import { showPendingOrderNotification } from './showPendingOrderNotification'

import { AppState } from '../../index'
import { AddPendingOrderParams } from '../actions'
import { setPopupData } from '../helpers'

jest.mock('./showPendingOrderNotification', () => ({
  ...jest.requireActual('./showPendingOrderNotification'),
  showPendingOrderNotification: jest.fn(),
}))

const showPendingOrderNotificationMock = showPendingOrderNotification as jest.MockedFunction<
  typeof showPendingOrderNotification
>

const inputToken = {
  address: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
  decimals: 18,
  symbol: 'ETH',
  name: 'Ethereum',
  chainId: 1,
}

const outputToken = {
  address: '0xadfb8d27671f14f297ee94135e266aaff8752e35',
  decimals: 18,
  symbol: 'DAI',
  name: 'Dai',
  chainId: 1,
}

const owner = '0x000001a'
const sellAmount = '100000000'
const buyAmount = '200000000000'

const MOCK_ETHFLOW_ORDER = {
  '0x001': {
    id: '0x001',
    order: {
      owner,
      inputToken,
      outputToken,
      sellAmount,
      buyAmount,
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
      owner,
      inputToken,
      outputToken,
      sellAmount,
      buyAmount,
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

    showPendingOrderNotificationMock.mockClear()
  })

  it('should not trigger pop up for inexistent order', () => {
    when(payloadMock.id).thenReturn('0x000')

    pendingOrderPopup(instance(storeMock), instance(payloadMock))

    expect(showPendingOrderNotificationMock).toHaveBeenCalledTimes(0)
  })

  it('should trigger pop up for ethflow order', () => {
    when(payloadMock.id).thenReturn('0x001')

    pendingOrderPopup(instance(storeMock), instance(payloadMock))

    expect(showPendingOrderNotificationMock).toHaveBeenCalledTimes(1)
    expect(showPendingOrderNotificationMock.mock.calls[0][0].orderCreationHash).toEqual(
      MOCK_ETHFLOW_ORDER['0x001'].order.orderCreationHash
    )
  })

  it('should trigger pop up for regular order', () => {
    when(payloadMock.id).thenReturn('0x002')
    when(payloadMock.order).thenReturn({ isHidden: false } as any)

    pendingOrderPopup(instance(storeMock), instance(payloadMock))

    expect(showPendingOrderNotificationMock).toHaveBeenCalledTimes(1)
  })

  it('should not trigger pop up for hidden order', () => {
    when(payloadMock.id).thenReturn('0x003')
    when(payloadMock.order).thenReturn({ isHidden: true } as any)

    pendingOrderPopup(instance(storeMock), instance(payloadMock))

    verify(storeMock.dispatch(anything())).never()
  })
})
