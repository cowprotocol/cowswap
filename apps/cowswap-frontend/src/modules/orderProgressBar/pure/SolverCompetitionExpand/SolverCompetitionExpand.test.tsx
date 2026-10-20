import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, RenderResult, screen } from '@testing-library/react'

import { SolverCompetition } from 'common/types/soverCompetition'

import { SolverCompetitionExpand } from './SolverCompetitionExpand.pure'

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
] as SolverCompetition[]

describe('SolverCompetitionExpand', () => {
  it('renders the collapsed summary row', () => {
    renderExpand(<SolverCompetitionExpand solvers={solvers} totalSolvers={12} />)

    expect(screen.getByTestId('solver-competition-expand').textContent).toContain('12 solvers competed')
    expect(screen.getByTestId('solver-competition-expand').textContent).toContain('Tsolver won')
  })

  it('expands rankings when the summary row is clicked', () => {
    renderExpand(<SolverCompetitionExpand solvers={solvers} />)

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByText('Solver auction rankings')).toBeTruthy()
    expect(screen.getByText('Winning solver')).toBeTruthy()
  })

  it('renders nothing when there are no solvers', () => {
    const { container } = renderExpand(<SolverCompetitionExpand solvers={[]} />)

    expect(container.innerHTML).toBe('')
  })
})
