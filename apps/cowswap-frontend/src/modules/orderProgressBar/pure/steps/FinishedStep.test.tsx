import { ReactElement, ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { render, RenderResult, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { Order } from 'legacy/state/orders/actions'

import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'

import { FinishedStep, FinishedSuccessHeading } from './FinishedStep'

import { getOrderMock } from '../../../../mocks/orderMock'
import { OrderProgressBarStepName } from '../../types'
import { WAIT_AND_SAVE_OUTCOME_DEMO } from '../WaitAndSaveOutcome/waitAndSaveOutcome.demo'

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
    tokenPair?: {
      cowParticipation?: { variant?: string; tooltip?: ReactNode }
      outputCurrencyInfo?: { secondaryAmount?: { prefix?: ReactNode; tooltip?: ReactNode } }
    }
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
        {tokenPair?.outputCurrencyInfo?.secondaryAmount ? (
          <div data-testid="received-surplus">
            {tokenPair.outputCurrencyInfo.secondaryAmount.prefix}
            {tokenPair.outputCurrencyInfo.secondaryAmount.tooltip}
          </div>
        ) : null}
        {tokenPair?.cowParticipation ? (
          <div data-testid="cow-participation-footer">{tokenPair.cowParticipation.variant ?? 'cow'}</div>
        ) : null}
      </div>
      {children}
    </div>
  ),
}))

jest.mock('../SolverCompetitionExpand/SolverCompetitionExpand.pure', () => ({
  SolverCompetitionExpand: () => <div data-testid="solver-competition-expand" />,
}))

jest.mock('../SolverAuctionResult/SolverAuctionResult.pure', () => ({
  SolverAuctionResult: () => <div data-testid="solver-auction-result" />,
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

const surplusData: SurplusData = {
  surplusAmount: CurrencyAmount.fromRawAmount(order.outputToken, '2470000'),
  surplusFiatValue: CurrencyAmount.fromRawAmount(order.outputToken, '7610000'),
  surplusToken: order.outputToken,
  surplusPercent: '0.51',
  showFiatValue: true,
  showSurplus: true,
}

describe('FinishedStep', () => {
  it('renders the expanded auction instead of the solver toggle when there is no surplus', () => {
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
    expect(screen.getByTestId('solver-auction-result')).toBeTruthy()
    expect(screen.queryByTestId('solver-competition-expand')).toBeNull()
    expect(screen.queryByTestId('finished-tips')).toBeNull()
    expect(screen.getByText('Share this swap')).toBeTruthy()
  })

  it('renders the success heading for Modal.Header chrome', () => {
    renderFinished(<FinishedSuccessHeading order={order} chainId={SupportedChainId.MAINNET} />)

    const heading = screen.getByTestId('confirmation-success-heading')
    expect(heading.textContent).toContain('Swap complete')
    expect(heading.textContent).toMatch(/Your .+ is in your wallet/)
    expect(screen.getByRole('link', { name: /View on Explorer/i }).getAttribute('href')).toContain('/orders/')
  })

  it('links a custom recipient address to the block explorer', () => {
    const receiver = '0xdd9EB88C5C6D2A85A08a96c7F0ccccE27Cb843cb'
    renderFinished(<FinishedSuccessHeading order={{ ...order, receiver }} chainId={SupportedChainId.MAINNET} />)

    const heading = screen.getByTestId('confirmation-success-heading')
    expect(heading.textContent).toMatch(/was sent to/)
    expect(screen.getByRole('link', { name: '0xdd9E...43cb' }).getAttribute('href')).toBe(
      `https://etherscan.io/address/${receiver}`,
    )
    expect(screen.getByRole('link', { name: /View on Explorer/i }).getAttribute('href')).toContain('/orders/')
  })

  it('omits solver expand and auction when there are no solvers', () => {
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
    expect(screen.queryByTestId('solver-auction-result')).toBeNull()
  })

  it('keeps surplus tips and omits WaitAndSaveOutcome by default', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
      >
        <div data-testid="finished-tips">Tips</div>
      </FinishedStep>,
    )

    expect(screen.queryByTestId('cow-participation-footer')).toBeNull()
    expect(screen.queryByTestId('wait-and-save-outcome')).toBeNull()
    expect(screen.queryByTestId('received-surplus')).toBeNull()
    expect(screen.getByTestId('finished-tips').textContent).toBe('Tips')
  })

  it('shows surplus under You received and keeps surplus tips on a regular swap', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
        surplusData={surplusData}
        solvers={[{ solver: 'tsolver', displayName: 'Tsolver' }]}
        totalSolvers={10}
      >
        <div data-testid="finished-tips">Tips</div>
      </FinishedStep>,
    )

    expect(screen.getByTestId('received-surplus').textContent).toContain('+')
    expect(screen.getByTestId('received-surplus').textContent).toContain(
      'The extra amount you received compared to your limit price.',
    )
    expect(screen.queryByTestId('wait-and-save-outcome')).toBeNull()
    expect(screen.getByTestId('finished-tips').textContent).toBe('Tips')
    expect(screen.getByTestId('solver-competition-expand')).toBeTruthy()
    expect(screen.queryByTestId('solver-auction-result')).toBeNull()

    const tips = screen.getByTestId('finished-tips')
    const solvers = screen.getByTestId('solver-competition-expand')
    expect(tips.compareDocumentPosition(solvers) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders WaitAndSaveOutcome instead of finished tips and surplus amount when a CoW gain is measured', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
        surplusData={surplusData}
        waitAndSave={{ footerVariant: 'cow', outcome: WAIT_AND_SAVE_OUTCOME_DEMO }}
        solvers={[{ solver: 'tsolver', displayName: 'Tsolver' }]}
        totalSolvers={10}
      >
        <div data-testid="finished-tips">Tips</div>
      </FinishedStep>,
    )

    expect(screen.getByTestId('cow-participation-footer').textContent).toBe('cow')
    expect(screen.getByTestId('wait-and-save-outcome')).toBeTruthy()
    expect(screen.queryByTestId('received-surplus')).toBeNull()
    expect(screen.queryByTestId('finished-tips')).toBeNull()
    expect(screen.getByTestId('solver-competition-expand')).toBeTruthy()

    const confirmation = screen.getByTestId('base-trade-confirmation')
    const outcome = screen.getByTestId('wait-and-save-outcome')
    const solvers = screen.getByTestId('solver-competition-expand')
    expect(confirmation.compareDocumentPosition(outcome) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(outcome.compareDocumentPosition(solvers) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('keeps the CoW footer and finished tips when the CoW gain cannot be measured', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
        waitAndSave={{ footerVariant: 'cow', outcome: null }}
        solvers={[{ solver: 'tsolver', displayName: 'Tsolver' }]}
        totalSolvers={10}
      >
        <div data-testid="finished-tips">Tips</div>
      </FinishedStep>,
    )

    expect(screen.getByTestId('cow-participation-footer').textContent).toBe('cow')
    expect(screen.queryByTestId('wait-and-save-outcome')).toBeNull()
    expect(screen.getByTestId('finished-tips').textContent).toBe('Tips')
    expect(screen.getByTestId('solver-competition-expand')).toBeTruthy()
    expect(screen.queryByTestId('solver-auction-result')).toBeNull()
  })

  it('shows the gain card with an unconfirmed matching footer', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
        waitAndSave={{ footerVariant: 'unconfirmed', outcome: WAIT_AND_SAVE_OUTCOME_DEMO }}
        solvers={[{ solver: 'tsolver', displayName: 'Tsolver' }]}
        totalSolvers={10}
      >
        <div data-testid="finished-tips">Tips</div>
      </FinishedStep>,
    )

    expect(screen.getByTestId('cow-participation-footer').textContent).toBe('unconfirmed')
    expect(screen.getByTestId('wait-and-save-outcome')).toBeTruthy()
    expect(screen.queryByTestId('finished-tips')).toBeNull()
  })

  it('shows an unconfirmed footer and finished tips when neither CoW nor gain is known', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
        waitAndSave={{ footerVariant: 'unconfirmed', outcome: null }}
      >
        <div data-testid="finished-tips">Tips</div>
      </FinishedStep>,
    )

    expect(screen.getByTestId('cow-participation-footer').textContent).toBe('unconfirmed')
    expect(screen.queryByTestId('wait-and-save-outcome')).toBeNull()
    expect(screen.getByTestId('finished-tips').textContent).toBe('Tips')
  })

  it('shows an unavailable footer when auction details are missing', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
        waitAndSave={{ footerVariant: 'unavailable', outcome: null }}
      >
        <div data-testid="finished-tips">Tips</div>
      </FinishedStep>,
    )

    expect(screen.getByTestId('cow-participation-footer').textContent).toBe('unavailable')
    expect(screen.queryByTestId('wait-and-save-outcome')).toBeNull()
    expect(screen.getByTestId('finished-tips').textContent).toBe('Tips')
  })

  it('uses regular finished chrome when the fill was not a CoW', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
        waitAndSave={{ footerVariant: null, outcome: null }}
        solvers={[{ solver: 'tsolver', displayName: 'Tsolver' }]}
        totalSolvers={10}
      >
        <div data-testid="finished-tips">Tips</div>
      </FinishedStep>,
    )

    expect(screen.queryByTestId('cow-participation-footer')).toBeNull()
    expect(screen.queryByTestId('wait-and-save-outcome')).toBeNull()
    expect(screen.queryByTestId('finished-tips')).toBeNull()
    expect(screen.getByTestId('solver-auction-result')).toBeTruthy()
  })
})
