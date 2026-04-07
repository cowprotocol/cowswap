import React from 'react'

import { render, screen } from '@testing-library/react'

import { VerboseDetails } from '../../components/orders/DetailsTable/VerboseDetails'
import { RICH_ORDER } from '../data/operator'

jest.mock('../../components/orders/DetailsTable/SolvedByBadge', () => ({
  SolvedByBadge: ({ solvedBy }: { solvedBy?: { displayName?: string } }): React.ReactNode => (
    <span>{solvedBy?.displayName || '-'}</span>
  ),
}))

jest.mock('../../components/common/DetailRow', () => ({
  DetailRow: ({ label, children }: { label: string; children: React.ReactNode }): React.ReactNode => (
    <div>
      <span>{label}</span>
      {children}
    </div>
  ),
}))

jest.mock('../../components/orders/FilledProgress', () => ({
  FilledProgress: (): React.ReactNode => <span>FilledProgress</span>,
}))

jest.mock('../../components/orders/GasFeeDisplay', () => ({
  GasFeeDisplay: (): React.ReactNode => <span>GasFeeDisplay</span>,
}))

jest.mock('../../components/orders/OrderPriceDisplay', () => ({
  OrderPriceDisplay: (): React.ReactNode => <span>OrderPriceDisplay</span>,
}))

jest.mock('../../components/orders/OrderSurplusDisplay', () => ({
  OrderSurplusDisplay: (): React.ReactNode => <span>OrderSurplusDisplay</span>,
}))

jest.mock('../../components/orders/OrderHooksDetails', () => ({
  OrderHooksDetails: ({ children }: { children: (content: React.ReactNode) => React.ReactNode }): React.ReactNode => (
    <>{children('Hooks content')}</>
  ),
}))

jest.mock('../../components/AppData/DecodeAppData', () => ({
  DecodeAppData: (): React.ReactNode => <span>DecodeAppData</span>,
}))

jest.mock('../../components/common/Spinner', () => ({
  __esModule: true,
  default: (): React.ReactNode => <span>Spinner</span>,
}))

describe('VerboseDetails', () => {
  const defaultProps = {
    order: RICH_ORDER,
    solvedBy: {
      solverId: 'alpha-solver',
      displayName: 'Alpha Solver',
      image: undefined,
    },
    isSolvedByLoading: false,
    isPriceInverted: false,
    invertPrice: jest.fn(),
    showFillsButton: false,
    viewFills: jest.fn(),
  }

  it('shows the solved by row when solver details are enabled', () => {
    render(<VerboseDetails {...defaultProps} showSolverDetails />)

    expect(screen.getByText('Solved by')).not.toBeNull()
    expect(screen.getByText('Alpha Solver')).not.toBeNull()
  })

  it('hides the solved by row when solver details are disabled', () => {
    render(<VerboseDetails {...defaultProps} showSolverDetails={false} />)

    expect(screen.queryByText('Solved by')).toBeNull()
    expect(screen.queryByText('Alpha Solver')).toBeNull()
  })
})
