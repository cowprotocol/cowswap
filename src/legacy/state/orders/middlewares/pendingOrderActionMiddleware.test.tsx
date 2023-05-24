import { pendingOrderActionMiddleware } from './pendingOrderActionMiddleware'
import { MiddlewareAPI } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
import { AppState } from '../../index'
import { AddPendingOrderParams } from '../actions'
import { OrderClass } from '@cowprotocol/cow-sdk'
describe('pendingOrderActionMiddleware', () => {
  it('When some conditions, then should dispatch addPopup event', () => {
    const dispatchFn = jest.fn()
    const store = {
      dispatch: dispatchFn,
      getState: () => ({
        orders: {
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
        },
      }),
    } as any as MiddlewareAPI<Dispatch, AppState>

    const payload = {
      id: '0x001',
      chainId: 1,
    } as any as AddPendingOrderParams

    const result = {}

    pendingOrderActionMiddleware(store, payload, result)

    expect(dispatchFn).toHaveBeenCalledTimes(1)
    expect(dispatchFn.mock.calls[0]).toMatchSnapshot()
  })
})
