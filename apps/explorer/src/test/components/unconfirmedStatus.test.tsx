import { render, screen } from '@testing-library/react'

import { StatusLabel } from '../../components/orders/StatusLabel'

describe('Unconfirmed TWAP parts', () => {
  it('renders a candidate status with a static clock instead of an open-order spinner', () => {
    const { container } = render(<StatusLabel status="unconfirmed" />)

    expect(screen.getByText('UNCONFIRMED')).not.toBeNull()
    expect(screen.queryByText('OPEN')).toBeNull()
    expect(container.querySelector('[data-icon="clock"]')).not.toBeNull()
    expect(container.querySelector('.fa-spin')).toBeNull()
  })
})
