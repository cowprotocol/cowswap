import { render, screen } from '@testing-library/react'

import { OrderStatus } from 'legacy/state/orders/actions'

import { TwapOrderStatus } from './TwapOrderStatus.pure'

describe('TwapOrderStatus', () => {
  it('does not treat an optimistic TWAP without children as cancelled', () => {
    render(
      <TwapOrderStatus childOrders={[]} orderStatus={OrderStatus.PENDING}>
        Open
      </TwapOrderStatus>,
    )

    expect(screen.getByText('Open')).not.toBeNull()
    expect(screen.queryByText('Order cancelled')).toBeNull()
  })
})
