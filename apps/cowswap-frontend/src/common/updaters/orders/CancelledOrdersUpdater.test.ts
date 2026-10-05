import { OrderStatus } from 'legacy/state/orders/actions'

import { shouldRecheckCancelledOrder } from './CancelledOrdersUpdater'

const ACCOUNT = '0xowner'
const NOW = Date.now()

function createOrder(
  overrides: Partial<Parameters<typeof shouldRecheckCancelledOrder>[0]> = {},
): Parameters<typeof shouldRecheckCancelledOrder>[0] {
  return {
    owner: ACCOUNT,
    creationTime: new Date(NOW - 1000).toISOString(),
    status: OrderStatus.PENDING,
    cancellationHash: undefined,
    cancellationHashTime: undefined,
    ...overrides,
  }
}

describe('shouldRecheckCancelledOrder', () => {
  it('rechecks a soft-cancelled order on any chain', () => {
    const order = createOrder({ cancellationHash: undefined })

    expect(shouldRecheckCancelledOrder(order, ACCOUNT, NOW)).toBe(true)
  })

  it('rechecks a hard-cancelled order on EVM to detect an earlier fill', () => {
    const order = createOrder({ cancellationHash: '0xhash', status: OrderStatus.CANCELLED })

    expect(shouldRecheckCancelledOrder(order, ACCOUNT, NOW)).toBe(true)
  })

  // Solana's cancel instruction has no such guarantee against a same-time solver fill, so it must
  // still be rechecked - this is the exact case that left a genuinely filled order stuck as "Cancelled".
  it('still rechecks a hard-cancelled order on Solana', () => {
    const order = createOrder({ cancellationHash: 'solana-sig', status: OrderStatus.CANCELLED })

    expect(shouldRecheckCancelledOrder(order, ACCOUNT, NOW)).toBe(true)
  })

  it('ignores an order owned by a different account', () => {
    const order = createOrder({ owner: '0xsomeoneelse' })

    expect(shouldRecheckCancelledOrder(order, ACCOUNT, NOW)).toBe(false)
  })

  it('ignores a soft-cancelled order created outside the recheck window', () => {
    const order = createOrder({ creationTime: new Date(NOW - 10 * 60 * 1000).toISOString() })

    expect(shouldRecheckCancelledOrder(order, ACCOUNT, NOW)).toBe(false)
  })

  // The window must be measured from the cancellation, not the order's creation - an order can sit
  // open for hours before being cancelled, and that's still a fresh cancellation worth rechecking.
  it('still rechecks a hard-cancelled Solana order created long before it was cancelled', () => {
    const order = createOrder({
      creationTime: new Date(NOW - 10 * 60 * 1000).toISOString(),
      cancellationHash: 'solana-sig',
      cancellationHashTime: new Date(NOW - 1000).toISOString(),
      status: OrderStatus.CANCELLED,
    })

    expect(shouldRecheckCancelledOrder(order, ACCOUNT, NOW)).toBe(true)
  })

  it('ignores a hard-cancelled Solana order whose cancellation itself is outside the recheck window', () => {
    const order = createOrder({
      creationTime: new Date(NOW - 10 * 60 * 1000).toISOString(),
      cancellationHash: 'solana-sig',
      cancellationHashTime: new Date(NOW - 10 * 60 * 1000).toISOString(),
      status: OrderStatus.CANCELLED,
    })

    expect(shouldRecheckCancelledOrder(order, ACCOUNT, NOW)).toBe(false)
  })
  it('rechecks an old EVM order from its recent cancellation time', () => {
    const order = createOrder({
      creationTime: new Date(NOW - 60 * 60 * 1000).toISOString(),
      cancellationHash: '0xhash',
      cancellationHashTime: new Date(NOW - 1000).toISOString(),
      status: OrderStatus.CANCELLED,
    })
    expect(shouldRecheckCancelledOrder(order, ACCOUNT, NOW)).toBe(true)
    expect(
      shouldRecheckCancelledOrder(
        { ...order, cancellationHashTime: new Date(NOW - 10 * 60 * 1000).toISOString() },
        ACCOUNT,
        NOW,
      ),
    ).toBe(false)
  })
})
