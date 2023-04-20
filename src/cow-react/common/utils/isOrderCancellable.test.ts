import { Order, OrderStatus } from 'state/orders/actions'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'
import { isOrderCancellable } from './isOrderCancellable'
import { COW } from 'constants/tokens'

describe('isOrderCancellable', () => {
  it('When order cancellation in progress, the it cannot be cancelled', () => {
    const order = {
      inputToken: COW[1],
      status: OrderStatus.PENDING,
      isCancelling: true, // <-----
      cancellationHash: undefined,
    } as Order

    expect(isOrderCancellable(order)).toBe(false)
    expect(isOrderCancellable({ ...order, isCancelling: false })).toBe(true)
  })

  it('When an order has a cancellationHash, the it cannot be cancelled', () => {
    const order = {
      inputToken: COW[1],
      status: OrderStatus.PENDING,
      isCancelling: false,
      cancellationHash: '0x0003', // <-----
    } as Order

    expect(isOrderCancellable(order)).toBe(false)
    expect(isOrderCancellable({ ...order, cancellationHash: undefined })).toBe(true)
  })

  it("When an order's status is CREATING, then the order is cancellable", () => {
    const order = {
      inputToken: NATIVE_CURRENCY_BUY_TOKEN[1],
      status: OrderStatus.CREATING, // <- CREATING
      isCancelling: false,
      cancellationHash: undefined,
    } as Order

    expect(isOrderCancellable(order)).toBe(true)
    expect(isOrderCancellable({ ...order, status: OrderStatus.FULFILLED })).toBe(false)
  })

  it("When an order's status is PENDING, then the order is cancellable", () => {
    const order = {
      inputToken: NATIVE_CURRENCY_BUY_TOKEN[1],
      status: OrderStatus.PENDING, // <- PENDING
      isCancelling: false,
      cancellationHash: undefined,
    } as Order

    expect(isOrderCancellable(order)).toBe(true)
    expect(isOrderCancellable({ ...order, status: OrderStatus.FAILED })).toBe(false)
  })

  it("When an order's status is not PENDING or CREATING, then the order is NOT cancellable", () => {
    ;[
      OrderStatus.FULFILLED,
      OrderStatus.PRESIGNATURE_PENDING,
      OrderStatus.FAILED,
      OrderStatus.CANCELLED,
      OrderStatus.EXPIRED,
    ].forEach((status) => {
      const order = {
        inputToken: NATIVE_CURRENCY_BUY_TOKEN[1],
        status, // <----
        isCancelling: false,
        cancellationHash: undefined,
      } as Order

      expect(isOrderCancellable(order)).toBe(false)
    })
  })
})
