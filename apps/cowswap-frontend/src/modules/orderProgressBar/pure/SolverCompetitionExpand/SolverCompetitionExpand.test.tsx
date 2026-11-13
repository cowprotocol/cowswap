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
    expect(screen.getByTestId('solver-competition-stack').children).toHaveLength(3)
    expect(screen.getByTestId('solver-competition-stack').textContent).toBe('TQF')
  })

  it('renders the CMS image for each stacked solver', () => {
    const cmsImage = 'https://cms.example.com/solver-logo.png'
    renderExpand(
      <SolverCompetitionExpand solvers={solvers.map((solver) => ({ ...solver, image: cmsImage }))} totalSolvers={12} />,
    )

    const images = screen.getByTestId('solver-competition-stack').querySelectorAll('img')

    expect(images).toHaveLength(3)
    images.forEach((image) => expect(image.getAttribute('src')).toBe(cmsImage))
  })

  it.each(['0xDd5A...C01b', '3jHwQj...E9be'])('renders a generic icon for the unidentified solver %s', (solver) => {
    renderExpand(<SolverCompetitionExpand solvers={[{ solver }] as SolverCompetition[]} totalSolvers={12} />)

    const stack = screen.getByTestId('solver-competition-stack')

    expect(stack.querySelector('svg')).not.toBeNull()
    expect(stack.textContent).toBe('')
  })

  it('names the solver on the summary row when only one provided a solution', () => {
    renderExpand(<SolverCompetitionExpand solvers={[solvers[0]]} totalSolvers={12} />)

    expect(screen.getByTestId('solver-competition-expand').textContent).toContain('Tsolver solved your order')
    expect(screen.getByTestId('solver-competition-expand').textContent).not.toContain('1 solver competed')
    expect(screen.getByTestId('solver-competition-expand').textContent).not.toContain('Tsolver won')
  })

  it('expands SolverAuctionResult when the summary row is clicked', () => {
    renderExpand(<SolverCompetitionExpand solvers={solvers} />)

    fireEvent.click(screen.getByRole('button', { name: /solvers competed/i }))

    expect(screen.getByTestId('solver-auction-result')).toBeTruthy()
    expect(screen.getByText('Winning solver')).toBeTruthy()
    expect(screen.getByTestId('solver-auction-result').textContent).toContain('4 solvers competed for your order')
  })

  it('expands to the named solver title when only one solver provided a solution', () => {
    renderExpand(<SolverCompetitionExpand solvers={[solvers[0]]} defaultExpanded />)

    expect(screen.getByTestId('solver-competition-expand').textContent).toContain('Tsolver solved your order')
    expect(screen.getByTestId('solver-auction-result').textContent).toContain('Tsolver solved your order')
    expect(screen.getByTestId('solver-competition-expand').textContent).not.toContain('Tsolver won')
  })

  it('renders nothing when there are no solvers', () => {
    const { container } = renderExpand(<SolverCompetitionExpand solvers={[]} />)

    expect(container.innerHTML).toBe('')
  })
})
