import React from 'react'

import { render, screen } from '@testing-library/react'

import { OrderStatus } from '../../api/operator/types'
import { StatusLabel } from '../../components/orders/StatusLabel'

jest.mock('api/operator', () => ({
  OrderStatus: {
    Expired: 'expired',
    Filled: 'filled',
    Cancelled: 'cancelled',
    Cancelling: 'cancelling',
    Signing: 'signing',
    Open: 'open',
    PartiallyFilled: 'partially filled',
  },
  ORDER_FINAL_FAILED_STATUSES: ['expired', 'cancelled'],
}))

jest.mock('../../components/orders/StatusLabel/StatusIcon', () => ({
  StatusIcon: ({ status }: { status: string }): React.ReactNode => <span data-testid="status-icon">{status}</span>,
}))

describe('StatusLabel', () => {
  it('uses the partially filled icon when a cancelled order was partially filled', () => {
    render(<StatusLabel status={OrderStatus.Cancelled} partiallyFilled />)

    expect(screen.getByTestId('status-icon').textContent).toBe(OrderStatus.PartiallyFilled)
    expect(screen.getByText('PARTIALLY FILLED')).not.toBeNull()
  })

  it('keeps the cancelled icon for fully cancelled orders', () => {
    render(<StatusLabel status={OrderStatus.Cancelled} />)

    expect(screen.getByTestId('status-icon').textContent).toBe(OrderStatus.Cancelled)
    expect(screen.getByText('CANCELLED')).not.toBeNull()
  })
})
