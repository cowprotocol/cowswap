import { ReactElement, ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { render, RenderResult, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { Order } from 'legacy/state/orders/actions'

import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'

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
    tokenPair?: {
      cowParticipation?: { tooltip: ReactNode }
      inputCurrencyInfo?: { secondaryAmount?: { prefix?: ReactNode; tooltip?: ReactNode } }
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
        {tokenPair?.inputCurrencyInfo?.secondaryAmount ? (
          <div data-testid="sold-surplus">
            {tokenPair.inputCurrencyInfo.secondaryAmount.prefix}
            {tokenPair.inputCurrencyInfo.secondaryAmount.tooltip}
          </div>
        ) : null}
        {tokenPair?.outputCurrencyInfo?.secondaryAmount ? (
          <div data-testid="received-surplus">
            {tokenPair.outputCurrencyInfo.secondaryAmount.prefix}
            {tokenPair.outputCurrencyInfo.secondaryAmount.tooltip}
          </div>
        ) : null}
        {tokenPair?.cowParticipation ? <div data-testid="cow-participation-footer" /> : null}
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

jest.mock('../../containers/TakeProfitPrompt/TakeProfitPrompt.container', () => ({
  TakeProfitPrompt: () => <div data-testid="take-profit-prompt" />,
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

    const prompt = screen.getByTestId('take-profit-prompt')
    const auction = screen.getByTestId('solver-auction-result')
    expect(prompt.compareDocumentPosition(auction) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders the success heading for Modal.Header chrome', () => {
    renderFinished(<FinishedSuccessHeading order={order} chainId={SupportedChainId.MAINNET} />)

    const heading = screen.getByTestId('confirmation-success-heading')
    expect(heading.textContent).toContain('Swap complete')
    expect(heading.textContent).toMatch(/Your .+ is in your wallet/)
    expect(screen.getByRole('link', { name: /View on Explorer/i }).getAttribute('href')).toContain('/orders/')
  })

  it('uses Order complete for cancellation-failed finished chrome', () => {
    renderFinished(
      <FinishedSuccessHeading
        order={order}
        chainId={SupportedChainId.MAINNET}
        stepName={OrderProgressBarStepName.CANCELLATION_FAILED}
      />,
    )

    expect(screen.getByTestId('confirmation-success-heading').textContent).toContain('Order complete')
    expect(screen.getByTestId('confirmation-success-heading').textContent).not.toContain('Swap complete')
  })

  it('uses an explicit success title when provided', () => {
    renderFinished(<FinishedSuccessHeading order={order} chainId={SupportedChainId.MAINNET} title="Order complete" />)

    expect(screen.getByTestId('confirmation-success-heading').textContent).toContain('Order complete')
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

  it('hides the take-profit prompt when cancellation failed', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.CANCELLATION_FAILED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
      >
        <div />
      </FinishedStep>,
    )

    expect(screen.queryByTestId('take-profit-prompt')).toBeNull()
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
    expect(screen.queryByTestId('sold-surplus')).toBeNull()
    expect(screen.queryByTestId('received-surplus')).toBeNull()
    expect(screen.getByTestId('finished-tips').textContent).toBe('Tips')
  })

  it('shows surplus under You received and keeps surplus tips on a regular sell swap', () => {
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

    expect(screen.queryByTestId('sold-surplus')).toBeNull()
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

  it('shows surplus under You sold for a buy order', () => {
    const buyOrder = {
      ...order,
      kind: OrderKind.BUY,
    } as Order
    const buySurplusData: SurplusData = {
      ...surplusData,
      surplusAmount: CurrencyAmount.fromRawAmount(buyOrder.inputToken, '2470000'),
      surplusFiatValue: CurrencyAmount.fromRawAmount(buyOrder.inputToken, '7610000'),
      surplusToken: buyOrder.inputToken,
    }

    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={buyOrder}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
        surplusData={buySurplusData}
        solvers={[{ solver: 'tsolver', displayName: 'Tsolver' }]}
        totalSolvers={10}
      >
        <div data-testid="finished-tips">Tips</div>
      </FinishedStep>,
    )

    expect(screen.queryByTestId('received-surplus')).toBeNull()
    expect(screen.getByTestId('sold-surplus').textContent).toContain('saved')
    expect(screen.getByTestId('sold-surplus').textContent).not.toContain('+')
    expect(screen.getByTestId('sold-surplus').textContent).toContain(
      'The amount you saved compared to your limit price.',
    )
    expect(screen.getByTestId('finished-tips').textContent).toBe('Tips')
    expect(screen.getByTestId('solver-competition-expand')).toBeTruthy()
  })

  it('renders WaitAndSaveOutcome instead of finished tips and surplus amount when Wait & Save has a gain', () => {
    renderFinished(
      <FinishedStep
        stepName={OrderProgressBarStepName.FINISHED}
        order={order}
        chainId={SupportedChainId.MAINNET}
        randomBenefit="CoW Protocol is MEV protected"
        surplusData={surplusData}
        showWaitAndSaveOutcome
        solvers={[{ solver: 'tsolver', displayName: 'Tsolver' }]}
        totalSolvers={10}
      >
        <div data-testid="finished-tips">Tips</div>
      </FinishedStep>,
    )

    expect(screen.getByTestId('cow-participation-footer')).toBeTruthy()
    expect(screen.getByTestId('wait-and-save-outcome')).toBeTruthy()
    expect(screen.queryByTestId('sold-surplus')).toBeNull()
    expect(screen.queryByTestId('received-surplus')).toBeNull()
    expect(screen.queryByTestId('finished-tips')).toBeNull()
    expect(screen.getByTestId('solver-competition-expand')).toBeTruthy()

    const confirmation = screen.getByTestId('base-trade-confirmation')
    const outcome = screen.getByTestId('wait-and-save-outcome')
    const solvers = screen.getByTestId('solver-competition-expand')
    expect(confirmation.compareDocumentPosition(outcome) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(outcome.compareDocumentPosition(solvers) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
