import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { SmartOrderStatus } from './constants'

import { EthFlowStepper, EthFlowStepperProps } from './index'

jest.mock('react-inlinesvg', () => ({
  __esModule: true,
  default: ({ description }: { description?: string }) => <svg aria-label={description} />,
}))

function getStepperProps(overrides?: Partial<EthFlowStepperProps>): EthFlowStepperProps {
  return {
    nativeTokenSymbol: 'ETH',
    tokenLabel: 'USDC',
    order: {
      orderId: 'order-1',
      state: SmartOrderStatus.INDEXED,
      isExpired: false,
      isCreated: true,
    },
    creation: {
      hash: '0xcreate',
      failed: false,
    },
    refund: {},
    cancellation: {},
    ...overrides,
  }
}

function renderComponent(props: EthFlowStepperProps): ReturnType<typeof render> {
  i18n.load('en-US', {})
  i18n.activate('en-US')

  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <EthFlowStepper {...props} />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('EthFlowStepper', () => {
  it('does not show terminal cancelled or refunded state while cancellation is still unverified', () => {
    renderComponent(
      getStepperProps({
        cancellation: {
          hash: '0xcancel',
          failed: undefined,
        },
      }),
    )

    expect(screen.getByText('Cancelling Order')).not.toBeNull()
    expect(screen.queryByText('Order Cancelled')).toBeNull()
    expect(screen.queryByText('ETH Refunded')).toBeNull()
  })

  it('shows cancelled and refunded state once cancellation and refund are confirmed', () => {
    renderComponent(
      getStepperProps({
        cancellation: {
          hash: '0xcancel',
          failed: false,
        },
        refund: {
          failed: false,
        },
      }),
    )

    expect(screen.getByText('Order Cancelled')).not.toBeNull()
    expect(screen.getByText('ETH Refunded')).not.toBeNull()
  })
})
