import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { getCowSoundReceiptBundle } from 'modules/sounds'

import { FinishedStep } from './FinishedStep'

import { getOrderMock } from '../../../../mocks/orderMock'
import { OrderProgressBarStepName } from '../../constants'

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: () => ({ disablePostTradeTips: false }),
}))

jest.mock('modules/sounds')

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

const receiptPlayMock = jest.fn().mockResolvedValue(undefined)
const successPlayMock = jest.fn().mockResolvedValue(undefined)
const receiptSoundMock = { currentTime: 1, play: receiptPlayMock } as unknown as HTMLAudioElement
const successSoundMock = { currentTime: 1, play: successPlayMock } as unknown as HTMLAudioElement

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
  beforeEach(() => {
    jest.clearAllMocks()
    receiptSoundMock.currentTime = 1
    successSoundMock.currentTime = 1
    jest.mocked(getCowSoundReceiptBundle).mockReturnValue([successSoundMock, receiptSoundMock])
  })

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

  it('replays the receipt animation and sound from a user click', () => {
    renderFinishedStep(OrderProgressBarStepName.FINISHED)

    fireEvent.click(screen.getByRole('button', { name: 'Replay' }))

    expect(receiptSoundMock.currentTime).toBe(0)
    expect(successSoundMock.currentTime).toBe(0)
    expect(receiptPlayMock).toHaveBeenCalledTimes(1)
    expect(successPlayMock).toHaveBeenCalledTimes(1)
  })
})
