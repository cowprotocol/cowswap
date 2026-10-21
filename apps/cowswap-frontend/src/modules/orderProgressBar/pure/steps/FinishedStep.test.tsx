import { ReactElement, ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { render, RenderResult, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { Order } from 'legacy/state/orders/actions'

import { FinishedStep, FinishedSuccessHeading } from './FinishedStep'

import { getOrderMock } from '../../../../mocks/orderMock'
import { OrderProgressBarStepName } from '../../types'

jest.mock('react-inlinesvg', () => ({
  __esModule: true,
  default: () => <span data-testid="inline-svg" />,
}))

jest.mock('modules/trade', () => ({
  BaseTradeConfirmation: ({
    heading,
    tokenPair,
    children,
  }: {
    heading?: { title: ReactNode; subtitle?: ReactNode }
    tokenPair?: { cowParticipation?: { tooltip: ReactNode } }
    children?: ReactNode
  }) => (
    <div data-testid="base-trade-confirmation">
      {heading ? (
        <div data-testid="confirmation-success-heading">
          <div>{heading.title}</div>
          <div>{heading.subtitle}</div>
        </div>
      ) : null}
      <div data-testid="trade-token-pair">
        {tokenPair?.cowParticipation ? <div data-testid="cow-participation-footer" /> : null}
      </div>
      {children}
    </div>
  ),
}))

jest.mock('../SolverCompetitionExpand/SolverCompetitionExpand.pure', () => ({
  SolverCompetitionExpand: () => <div data-testid="solver-competition-expand" />,
}))

jest.mock('../WaitAndSaveOutcome/WaitAndSaveOutcome.pure', () => ({
  WaitAndSaveOutcome: () => <div data-testid="wait-and-save-outcome" />,
}))

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: () => ({ disablePostTradeTips: false }),
}))

jest.mock('../../hooks/useWithConfetti', () => ({
  useWithConfetti: () => false,
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
})

function renderFinished(element: ReactElement): RenderResult {
  return render(
    <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
      <I18nProvider i18n={i18n}>{element}</I18nProvider>
    </StyledComponentsThemeProvider>,
  )
}

const order = {
  ...getOrderMock(SupportedChainId.MAINNET),
  apiAdditionalInfo: {
    executedBuyAmount: '1000000000000000000',
    executedSellAmount: '2000000000000000000',
  },
} as Order

describe('FinishedStep', () => {
  it('renders BaseTradeConfirmation with solvers and share as children', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
        solvers={[
          { solver: 'tsolver', displayName: 'Tsolver' },
          { solver: 'quasi', displayName: 'Quasi' },
        ]}
        totalSolvers={10}
      >
        <div data-testid="finished-tips">Tips</div>
      </FinishedStep>,
    )

    expect(screen.getByTestId('base-trade-confirmation')).toBeTruthy()
    expect(screen.queryByTestId('confirmation-success-heading')).toBeNull()
    expect(screen.getByTestId('solver-competition-expand')).toBeTruthy()
    expect(screen.getByTestId('finished-tips').textContent).toBe('Tips')
    expect(screen.getByText('Share this tip!')).toBeTruthy()
  })

  it('renders the success heading for Modal.Header chrome', () => {
    renderFinished(<FinishedSuccessHeading order={order} chainId={SupportedChainId.MAINNET} />)

    const heading = screen.getByTestId('confirmation-success-heading')
    expect(heading.textContent).toContain('Swap complete')
    expect(heading.textContent).toMatch(/Your .+ is in your wallet/)
  })

  it('omits solver expand when there are no solvers', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
      >
        <div />
      </FinishedStep>,
    )

    expect(screen.queryByTestId('solver-competition-expand')).toBeNull()
  })

  it('omits CoW footer and WaitAndSaveOutcome when Wait & Save is off', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
      >
        <div />
      </FinishedStep>,
    )

    expect(screen.queryByTestId('cow-participation-footer')).toBeNull()
    expect(screen.queryByTestId('wait-and-save-outcome')).toBeNull()
  })

  it('renders CoW footer and WaitAndSaveOutcome above solvers when Wait & Save is on', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
        showWaitAndSave
        solvers={[{ solver: 'tsolver', displayName: 'Tsolver' }]}
        totalSolvers={10}
      >
        <div />
      </FinishedStep>,
    )

    expect(screen.getByTestId('cow-participation-footer')).toBeTruthy()
    expect(screen.getByTestId('wait-and-save-outcome')).toBeTruthy()
    expect(screen.getByTestId('solver-competition-expand')).toBeTruthy()

    const confirmation = screen.getByTestId('base-trade-confirmation')
    const outcome = screen.getByTestId('wait-and-save-outcome')
    const solvers = screen.getByTestId('solver-competition-expand')
    expect(confirmation.compareDocumentPosition(outcome) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(outcome.compareDocumentPosition(solvers) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
