import { ReactElement } from 'react'

import { useAddSnackbar } from '@cowprotocol/snackbars'

import { act, render } from '@testing-library/react'

import { ORDERS_NOTIFICATION_HANDLERS } from './handlers'

import { OrderStatusEvents } from '../../events/events'
import { ORDER_STATUS_EVENT_EMITTER } from '../../events/orderStatusEventEmitter'

import { OrdersNotificationsUpdater } from './index'

jest.mock('@cowprotocol/snackbars', () => ({
  useAddSnackbar: jest.fn(),
}))

jest.mock('./handlers', () => ({
  ORDERS_NOTIFICATION_HANDLERS: {
    ON_FULFILLED_ORDER: {
      icon: 'success',
      handler: jest.fn(() => null),
    },
  },
}))

const useAddSnackbarMock = useAddSnackbar as jest.MockedFunction<typeof useAddSnackbar>
const fulfilledHandlerMock = ORDERS_NOTIFICATION_HANDLERS[OrderStatusEvents.ON_FULFILLED_ORDER]
  .handler as jest.MockedFunction<(payload: never) => ReactElement | null>

describe('OrdersNotificationsUpdater', () => {
  beforeEach(() => {
    useAddSnackbarMock.mockReturnValue(jest.fn())
    fulfilledHandlerMock.mockReturnValue(<div>fulfilled</div>)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('adds a fulfilled snackbar only once per order', () => {
    const addSnackbar = jest.fn()
    useAddSnackbarMock.mockReturnValue(addSnackbar)

    render(<OrdersNotificationsUpdater />)

    const payload = {
      chainId: 1,
      order: { uid: 'order-1' },
    } as never

    act(() => {
      ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_FULFILLED_ORDER, payload)
      ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_FULFILLED_ORDER, payload)
    })

    expect(addSnackbar).toHaveBeenCalledTimes(1)
    expect(addSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        id: `${OrderStatusEvents.ON_FULFILLED_ORDER}:1:order-1`,
      }),
    )
  })

  it('still shows fulfilled snackbars for different orders', () => {
    const addSnackbar = jest.fn()
    useAddSnackbarMock.mockReturnValue(addSnackbar)

    render(<OrdersNotificationsUpdater />)

    act(() => {
      ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_FULFILLED_ORDER, {
        chainId: 1,
        order: { uid: 'order-1' },
      } as never)
      ORDER_STATUS_EVENT_EMITTER.emit(OrderStatusEvents.ON_FULFILLED_ORDER, {
        chainId: 1,
        order: { uid: 'order-2' },
      } as never)
    })

    expect(addSnackbar).toHaveBeenCalledTimes(2)
  })
})
