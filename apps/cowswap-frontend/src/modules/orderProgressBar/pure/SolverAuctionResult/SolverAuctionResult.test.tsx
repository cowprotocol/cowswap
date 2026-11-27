import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { USDC_MAINNET } from '@cowprotocol/common-const'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { fireEvent, render, RenderResult, screen } from '@testing-library/react'

import { useUsdAmount } from 'modules/usdAmount'

import { SolverCompetition } from 'common/types/soverCompetition'

import { SolverAuctionResult } from './SolverAuctionResult.pure'
import { getSolverBidFillPercent } from './SolverAuctionResult.utils'

jest.mock('modules/usdAmount', () => ({
  useUsdAmount: jest.fn().mockReturnValue({ value: null, isLoading: false }),
}))

const mockedUseUsdAmount = useUsdAmount as jest.MockedFunction<typeof useUsdAmount>

i18n.load('en-US', {})
i18n.activate('en-US')

class TestPointerEvent extends MouseEvent {
  readonly pointerType: string

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.pointerType = init.pointerType ?? ''
  }
}

beforeAll(() => {
  Object.defineProperty(window, 'PointerEvent', { value: TestPointerEvent, configurable: true })

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

function getBidTrigger(bidValues: HTMLElement[], index: number): HTMLElement {
  const trigger = bidValues[index]?.parentElement

  if (!trigger) {
    throw new Error(`Missing solver auction bid trigger at index ${index}`)
  }

  return trigger
}

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
  beforeEach(() => {
    mockedUseUsdAmount.mockReturnValue({ value: null, isLoading: false })
  })

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
    expect(screen.getByTestId('solver-auction-winner-info')).toBeTruthy()
    expect(screen.getByTestId('solver-auction-dot-map').children).toHaveLength(63)
  })

  it('names the solver when only one provided a solution', () => {
    renderResult(<SolverAuctionResult solvers={[solvers[0]]} totalSolvers={1} buyToken={buyToken} />)

    const root = screen.getByTestId('solver-auction-result')

    expect(root.textContent).toContain('Tsolver solved your order')
    expect(root.textContent).toContain('It was the only bid this time.')
    expect(root.textContent).not.toContain('competed for your order')
    expect(root.textContent).toContain('1 solver')
    expect(root.textContent).not.toContain('1 solvers')
    expect(screen.queryByRole('button', { name: /view all bids/i })).toBeNull()
    expect(screen.getByRole('link', { name: /how the auction works/i })).toBeTruthy()
  })

  it('shows the first three solvers and expands on view all bids', () => {
    renderResult(<SolverAuctionResult solvers={solvers} />)

    const extraSolvers = screen.getByTestId('solver-auction-extra-solvers')

    expect(screen.getByText('Tsolver')).toBeTruthy()
    expect(screen.getByText('Quasi')).toBeTruthy()
    expect(screen.getByText('Fractal')).toBeTruthy()
    expect(extraSolvers.getAttribute('data-expanded')).toBe('false')
    expect(screen.getByRole('link', { name: /how the auction works/i })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /view all bids/i }))

    expect(extraSolvers.getAttribute('data-expanded')).toBe('true')
    expect(screen.getByText('Barn')).toBeTruthy()
    expect(screen.getByRole('button', { name: /show less/i })).toBeTruthy()
  })

  it('renders bid rows as relative progress bars', () => {
    renderResult(<SolverAuctionResult solvers={solvers} buyToken={buyToken} />)

    const fills = screen.getAllByTestId('solver-auction-row-fill')
    const winnerAmount = CurrencyAmount.fromRawAmount(buyToken, '36840000000000000000')
    const collapsedWorst = CurrencyAmount.fromRawAmount(buyToken, '36400000000000000000')
    const quasiAmount = CurrencyAmount.fromRawAmount(buyToken, '36600000000000000000')
    const quasiPercent = getSolverBidFillPercent(quasiAmount, winnerAmount, collapsedWorst)
    const fractalPercent = getSolverBidFillPercent(collapsedWorst, winnerAmount, collapsedWorst)

    expect(fills).toHaveLength(3)
    expect(fills[0]?.getAttribute('data-percent')).toBe(String(quasiPercent))
    expect(fills[1]?.getAttribute('data-percent')).toBe(String(fractalPercent))
    expect(fills[2]?.getAttribute('data-percent')).toBe('10')
    expect(fractalPercent).toBe(10)

    fireEvent.click(screen.getByRole('button', { name: /view all bids/i }))

    const expandedFills = screen.getAllByTestId('solver-auction-row-fill')
    const expandedWorst = CurrencyAmount.fromRawAmount(buyToken, '36000000000000000000')

    expect(expandedFills).toHaveLength(3)
    expect(expandedFills[0]?.getAttribute('data-percent')).toBe(
      String(getSolverBidFillPercent(quasiAmount, winnerAmount, expandedWorst)),
    )
    expect(expandedFills[2]?.getAttribute('data-percent')).toBe(
      String(getSolverBidFillPercent(expandedWorst, winnerAmount, expandedWorst)),
    )
  })

  it('shows -<$0.01 when the usd bid gap is below one cent', () => {
    mockedUseUsdAmount.mockReturnValue({
      value: CurrencyAmount.fromRawAmount(USDC_MAINNET, '9000'),
      isLoading: false,
    })

    renderResult(<SolverAuctionResult solvers={solvers} buyToken={buyToken} />)

    expect(screen.getAllByText('-<$0.01').length).toBeGreaterThan(0)
  })

  it('shows each bid amount in token units on price hover', () => {
    mockedUseUsdAmount.mockReturnValue({
      value: CurrencyAmount.fromRawAmount(USDC_MAINNET, '9000'),
      isLoading: false,
    })

    renderResult(<SolverAuctionResult solvers={solvers} buyToken={buyToken} />)

    const bidValues = screen.getAllByTestId('solver-auction-bid-value')
    const winnerTrigger = getBidTrigger(bidValues, 0)
    const quasiTrigger = getBidTrigger(bidValues, 1)

    fireEvent.pointerEnter(winnerTrigger, { pointerType: 'mouse' })
    expect(screen.getByText('36.84 RAI')).toBeTruthy()

    fireEvent.pointerEnter(quasiTrigger, { pointerType: 'mouse' })
    expect(screen.getByText('36.6 RAI')).toBeTruthy()
  })

  it('renders nothing when there are no solvers', () => {
    const { container } = renderResult(<SolverAuctionResult solvers={[]} />)

    expect(container.innerHTML).toBe('')
  })
})
