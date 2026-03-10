import React from 'react'

import { render, screen } from '@testing-library/react'

jest.mock('../../components/orders/OrderDetails/FillsTableRow', () => ({
  FillsTableRow: (): React.ReactNode => (
    <tr>
      <td>Mock fill row</td>
    </tr>
  ),
}))

import { FillsTable } from '../../components/orders/OrderDetails/FillsTable'

const TABLE_STATE = {
  pageSize: 10,
  pageOffset: 0,
}

describe('FillsTable', () => {
  it('shows the solver column when solver details are enabled', () => {
    render(
      <FillsTable
        trades={[]}
        order={null}
        tableState={TABLE_STATE}
        isPriceInverted={false}
        invertPrice={jest.fn()}
        showSolverDetails
      />,
    )

    expect(screen.getByText('Solver')).not.toBeNull()
  })

  it('hides the solver column when solver details are disabled', () => {
    render(
      <FillsTable
        trades={[]}
        order={null}
        tableState={TABLE_STATE}
        isPriceInverted={false}
        invertPrice={jest.fn()}
        showSolverDetails={false}
      />,
    )

    expect(screen.queryByText('Solver')).toBeNull()
  })
})
