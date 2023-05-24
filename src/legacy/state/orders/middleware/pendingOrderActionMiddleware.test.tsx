import { pendingOrderActionMiddleware } from './pendingOrderActionMiddleware'
import { MiddlewareAPI } from '@reduxjs/toolkit'
import { AnyAction, Dispatch } from 'redux'
import { AppState } from '../../index'
import { AddPendingOrderParams } from '../actions'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { capture, instance, mock, when } from 'ts-mockito'

const ordersMockData = {
  1: {
    pending: {
      '0x001': {
        id: '0x001',
        order: {
          summary: 'summary',
          orderClass: OrderClass.LIMIT,
          orderCreationHash: '0xhash',
        },
      },
    },
  },
}

describe('pendingOrderActionMiddleware', () => {
  it('When some conditions, then should dispatch addPopup event', () => {
    const result = {}

    const storeMock = mock<MiddlewareAPI<Dispatch, AppState>>()
    const payloadMock = mock<AddPendingOrderParams>()

    when(storeMock.getState()).thenReturn({ orders: ordersMockData } as any)

    when(payloadMock.chainId).thenReturn(1)
    when(payloadMock.id).thenReturn('0x001')

    pendingOrderActionMiddleware(instance(storeMock), instance(payloadMock), result)

    const [addPopupAction] = capture(storeMock.dispatch<AnyAction>).first()

    expect(addPopupAction).toMatchSnapshot()
  })
})
