import { Order, OrderStatus } from 'state/orders/actions'
import { NATIVE_CURRENCY_BUY_TOKEN } from 'custom/constants'
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

  describe('When is eth-flow order', () => {
    it("And order's status is CREATING, then order is cancellable", () => {
      const order = {
        inputToken: NATIVE_CURRENCY_BUY_TOKEN[1], // Eth as input token
        status: OrderStatus.CREATING, // <- CREATING
        isCancelling: false,
        cancellationHash: undefined,
      } as Order

      expect(isOrderCancellable(order)).toBe(true)
      expect(isOrderCancellable({ ...order, status: OrderStatus.FULFILLED })).toBe(false)
    })

    it("And order's status is PENDING, then order is cancellable", () => {
      const order = {
        inputToken: NATIVE_CURRENCY_BUY_TOKEN[1], // Eth as input token
        status: OrderStatus.PENDING, // <- PENDING
        isCancelling: false,
        cancellationHash: undefined,
      } as Order

      expect(isOrderCancellable(order)).toBe(true)
      expect(isOrderCancellable({ ...order, status: OrderStatus.FAILED })).toBe(false)
    })
  })

  describe('When is not eth-flow order', () => {
    it('And the is a cancellation hash, then order is NOT cancellable', () => {
      const order = {
        inputToken: COW[1],
        status: OrderStatus.PENDING,
        isCancelling: false,
        cancellationHash: '0x0001', // <-----
      } as Order

      expect(isOrderCancellable(order)).toBe(false)
      expect(isOrderCancellable({ ...order, cancellationHash: undefined })).toBe(true)
    })
  })
})
