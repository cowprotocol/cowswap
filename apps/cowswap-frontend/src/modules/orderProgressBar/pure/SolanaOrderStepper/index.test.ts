import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { shouldShowSolanaOrderStepper } from './index'

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'orderId',
    status: OrderStatus.CREATING,
    ...overrides,
  } as Order
}

describe('shouldShowSolanaOrderStepper', () => {
  it('returns false when there is no order', () => {
    expect(shouldShowSolanaOrderStepper(undefined)).toBe(false)
  })

  it('returns true while the order is still being created', () => {
    expect(shouldShowSolanaOrderStepper(buildOrder({ status: OrderStatus.CREATING }))).toBe(true)
  })

  it('returns false once the order has been indexed as pending', () => {
    expect(shouldShowSolanaOrderStepper(buildOrder({ status: OrderStatus.PENDING }))).toBe(false)
  })

  it('returns false for a fulfilled order', () => {
    expect(shouldShowSolanaOrderStepper(buildOrder({ status: OrderStatus.FULFILLED }))).toBe(false)
  })
})
