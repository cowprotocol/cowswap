import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { FinishedStep } from './FinishedStep'

import { getOrderMock } from '../../../../mocks/orderMock'
import { OrderProgressBarStepName } from '../../constants'

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: () => ({ disablePostTradeTips: false }),
}))

jest.mock('react-inlinesvg', () => {
  return function MockSvg() {
    return <svg />
  }
})

jest.mock('../PrintedOrderReceipt/PrintedOrderReceipt.pure', () => ({
  PrintedOrderReceipt: () => <div>Printed receipt</div>,
}))

const order = {
  ...getOrderMock(SupportedChainId.MAINNET),
  status: OrderStatus.FULFILLED,
} as Order

function renderFinishedStep(stepName: OrderProgressBarStepName): ReturnType<typeof render> {
  return render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider theme={getCowswapTheme(false)}>
        <FinishedStep
          order={order}
          chainId={SupportedChainId.MAINNET}
          stepName={stepName}
          solvers={[{ solver: 'naive', executedAmounts: { sell: '1', buy: '1' } }]}
        >
          <div>Post-trade extra</div>
        </FinishedStep>
      </ThemeProvider>
    </I18nProvider>,
  )
}

describe('FinishedStep', () => {
  it('shows only the printed receipt for a successful completion', () => {
    renderFinishedStep(OrderProgressBarStepName.FINISHED)

    expect(screen.getByText('Printed receipt')).not.toBeNull()
    expect(screen.queryByText('Solver auction rankings')).toBeNull()
    expect(screen.queryByText('Post-trade extra')).toBeNull()
    expect(screen.queryByText(/Share this/)).toBeNull()
  })

  it('keeps post-trade extras for cancellation failures', () => {
    renderFinishedStep(OrderProgressBarStepName.CANCELLATION_FAILED)

    expect(screen.getByText('Printed receipt')).not.toBeNull()
    expect(screen.getByText('Solver auction rankings')).not.toBeNull()
    expect(screen.getByText('Post-trade extra')).not.toBeNull()
    expect(screen.getByText(/Share this/)).not.toBeNull()
  })
})
