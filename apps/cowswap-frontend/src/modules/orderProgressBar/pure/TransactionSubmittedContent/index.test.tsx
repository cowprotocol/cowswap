import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { render, RenderResult, screen } from '@testing-library/react'
import { activityDerivedStateMock } from 'mocks/activityDerivedStateMock'
import { getOrderMock } from 'mocks/orderMock'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { ActivityStatus } from 'common/types/activity'

import { OrderProgressBarStepName } from '../../constants'

import { TransactionSubmittedContent } from './index'

jest.mock('../OrderProgressBar', () => ({
  OrderProgressBar: ({ stepName }: { stepName?: string }) => <div data-testid="order-progress-bar">{stepName}</div>,
}))

jest.mock('../steps/FinishedStep', () => ({
  FinishedSuccessHeading: () => <div data-testid="finished-success-heading">Swap complete</div>,
}))

jest.mock('modules/wallet', () => ({
  WatchAssetInWallet: () => null,
}))

jest.mock('modules/ethFlow', () => ({
  EthFlowStepper: () => <div data-testid="eth-flow-stepper" />,
}))

jest.mock('modules/account', () => ({
  GnosisSafeTxDetails: () => null,
}))

jest.mock('legacy/components/TransactionConfirmationModal/DisplayLink', () => ({
  DisplayLink: () => null,
}))

jest.mock('common/pure/CancelButton', () => ({
  CancelButton: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
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

function renderContent(stepName: OrderProgressBarStepName = OrderProgressBarStepName.FINISHED): RenderResult {
  const order = getOrderMock(SupportedChainId.MAINNET)

  return render(
    <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
      <I18nProvider i18n={i18n}>
        <TransactionSubmittedContent
          chainId={SupportedChainId.MAINNET}
          hash={order.id}
          onDismiss={() => undefined}
          activityDerivedState={{
            ...activityDerivedStateMock,
            isConfirmed: true,
            isOrder: true,
            order,
            status: ActivityStatus.CONFIRMED,
          }}
          orderProgressBarProps={{
            chainId: SupportedChainId.MAINNET,
            isBridgingTrade: false,
            isProgressBarSetup: true,
            showCancellationModal: null,
            stepName,
          }}
        />
      </I18nProvider>
    </StyledComponentsThemeProvider>,
  )
}

describe('TransactionSubmittedContent', () => {
  it('opens the success modal once the order is finished', () => {
    renderContent()

    expect(screen.getByTestId('finished-success-heading')).toBeTruthy()
    expect(screen.getByTestId('order-progress-bar').textContent).toBe(OrderProgressBarStepName.FINISHED)
  })
})
