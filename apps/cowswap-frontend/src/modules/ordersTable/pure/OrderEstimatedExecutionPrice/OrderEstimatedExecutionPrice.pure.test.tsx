import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { fireEvent, render, screen } from '@testing-library/react'

import { UPDATE_FALLBACK_HANDLER_WARNING } from './orderEstimatedExecutionPrice.constants'
import { OrderEstimatedExecutionPrice } from './OrderEstimatedExecutionPrice.pure'

jest.mock('react-inlinesvg', () => {
  return function MockSvg() {
    return <svg />
  }
})

function renderWithI18n(ui: ReactNode): ReturnType<typeof render> {
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>)
}

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

describe('OrderEstimatedExecutionPrice() – fallback handler warning', () => {
  it('renders the "Update fallback handler" reason label', () => {
    renderWithI18n(
      <OrderEstimatedExecutionPrice
        amount={undefined}
        tokenSymbol={undefined}
        isInverted={false}
        isUnfillable={true}
        canShowWarning={true}
        warningText={UPDATE_FALLBACK_HANDLER_WARNING}
      />,
    )

    expect(screen.getByText('Update fallback handler')).not.toBeNull()
  })

  it('reveals the fallback handler explanation on hover', async () => {
    renderWithI18n(
      <OrderEstimatedExecutionPrice
        amount={undefined}
        tokenSymbol={undefined}
        isInverted={false}
        isUnfillable={true}
        canShowWarning={true}
        warningText={UPDATE_FALLBACK_HANDLER_WARNING}
      />,
    )

    fireEvent.mouseEnter(screen.getByText('Update fallback handler'))

    expect(await screen.findByText(/Your Safe fallback handler was changed/i)).not.toBeNull()
  })
})
