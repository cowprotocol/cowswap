import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { Token } from '@cowprotocol/currency'

import { fireEvent, render, RenderResult, screen } from '@testing-library/react'

import { SolverCompetition } from 'common/types/soverCompetition'

import { SolverAuctionResult } from './SolverAuctionResult.pure'

jest.mock('modules/usdAmount', () => ({
  useUsdAmount: jest.fn().mockReturnValue({ value: null, isLoading: false }),
}))

i18n.load('en-US', {})
i18n.activate('en-US')

function renderResult(element: ReactElement): RenderResult {
  return render(<I18nProvider i18n={i18n}>{element}</I18nProvider>)
}

const buyToken = new Token(1, '0x0000000000000000000000000000000000000001', 18, 'RAI', 'Rai Reflex Index')

const solvers = [
  {
    solver: 'tsolver',
    displayName: 'Tsolver',
    executedAmounts: { sell: '1000000000000000000', buy: '36840000000000000000' },
  },
  {
    solver: 'quasi',
    displayName: 'Quasi',
    executedAmounts: { sell: '1000000000000000000', buy: '36600000000000000000' },
  },
  {
    solver: 'fractal',
    displayName: 'Fractal',
    executedAmounts: { sell: '1000000000000000000', buy: '36400000000000000000' },
  },
  {
    solver: 'barn',
    displayName: 'Barn',
    executedAmounts: { sell: '1000000000000000000', buy: '36000000000000000000' },
  },
] as SolverCompetition[]

describe('SolverAuctionResult', () => {
  it('renders auction header, legend, and winning badge', () => {
    renderResult(<SolverAuctionResult solvers={solvers} totalSolvers={61} buyToken={buyToken} />)

    const root = screen.getByTestId('solver-auction-result')

    expect(root.textContent).toContain('Solver auction')
    expect(root.textContent).toContain('4 solvers competed for your order')
    expect(root.textContent).toContain('1 won')
    expect(root.textContent).toContain('3 also bid')
    expect(root.textContent).toContain("57 didn't bid")
    expect(root.textContent).toContain('61 solvers')
    expect(screen.getByText('Winning solver')).toBeTruthy()
    expect(screen.getByTestId('solver-auction-dot-map').children).toHaveLength(37)
  })

  it('shows the first three solvers and expands on view all bids', () => {
    renderResult(<SolverAuctionResult solvers={solvers} />)

    expect(screen.getByText('Tsolver')).toBeTruthy()
    expect(screen.getByText('Quasi')).toBeTruthy()
    expect(screen.getByText('Fractal')).toBeTruthy()
    expect(screen.queryByText('Barn')).toBeNull()

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByText('Barn')).toBeTruthy()
  })

  it('renders nothing when there are no solvers', () => {
    const { container } = renderResult(<SolverAuctionResult solvers={[]} />)

    expect(container.innerHTML).toBe('')
  })
})
