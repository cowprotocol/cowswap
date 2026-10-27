import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, RenderResult, screen } from '@testing-library/react'

import { SolverCompetition } from 'common/types/soverCompetition'

import { SolverCompetitionExpand } from './SolverCompetitionExpand.pure'

jest.mock('modules/usdAmount', () => ({
  useUsdAmount: jest.fn().mockReturnValue({ value: null, isLoading: false }),
}))

i18n.load('en-US', {})
i18n.activate('en-US')

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    (() =>
      ({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
      }) as unknown as MediaQueryList)

  class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
  })
})

function renderExpand(element: ReactElement): RenderResult {
  return render(<I18nProvider i18n={i18n}>{element}</I18nProvider>)
}

const solvers = [
  { solver: 'tsolver', displayName: 'Tsolver' },
  { solver: 'quasi', displayName: 'Quasi' },
  { solver: 'fractal', displayName: 'Fractal' },
  { solver: 'barn', displayName: 'Barn' },
] as SolverCompetition[]

describe('SolverCompetitionExpand', () => {
  it('renders the collapsed summary row with up to three solver icons', () => {
    renderExpand(<SolverCompetitionExpand solvers={solvers} totalSolvers={12} />)

    expect(screen.getByTestId('solver-competition-expand').textContent).toContain('4 solvers competed')
    expect(screen.getByTestId('solver-competition-expand').textContent).not.toContain('12 solvers competed')
    expect(screen.getByTestId('solver-competition-expand').textContent).toContain('Tsolver won')
    expect(screen.getByTestId('solver-competition-stack').querySelectorAll('img')).toHaveLength(3)
  })

  it('names the solver on the summary row when only one provided a solution', () => {
    renderExpand(<SolverCompetitionExpand solvers={[solvers[0]]} totalSolvers={12} />)

    expect(screen.getByTestId('solver-competition-expand').textContent).toContain('Tsolver solved your order')
    expect(screen.getByTestId('solver-competition-expand').textContent).not.toContain('1 solver competed')
    expect(screen.getByTestId('solver-competition-expand').textContent).not.toContain('Tsolver won')
  })

  it('expands SolverAuctionResult when the summary row is clicked', () => {
    renderExpand(<SolverCompetitionExpand solvers={solvers} />)

    const toggle = screen.getByRole('button', { name: /solvers competed/i })

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByTestId('solver-auction-result').closest('[aria-hidden]')?.getAttribute('aria-hidden')).toBe(
      'true',
    )

    fireEvent.click(toggle)

    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByTestId('solver-auction-result').closest('[aria-hidden]')?.getAttribute('aria-hidden')).toBe(
      'false',
    )
    expect(screen.getByText('Winning solver')).toBeTruthy()
    expect(screen.getByTestId('solver-auction-result').textContent).toContain('4 solvers competed for your order')
  })

  it('expands to the named solver title when only one solver provided a solution', () => {
    renderExpand(<SolverCompetitionExpand solvers={[solvers[0]]} defaultExpanded />)

    expect(screen.getByRole('button', { name: /solved your order/i }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByTestId('solver-competition-expand').textContent).toContain('Tsolver solved your order')
    expect(screen.getByTestId('solver-auction-result').textContent).toContain('Tsolver solved your order')
    expect(screen.getByTestId('solver-competition-expand').textContent).not.toContain('Tsolver won')
  })

  it('renders nothing when there are no solvers', () => {
    const { container } = renderExpand(<SolverCompetitionExpand solvers={[]} />)

    expect(container.innerHTML).toBe('')
  })
})
