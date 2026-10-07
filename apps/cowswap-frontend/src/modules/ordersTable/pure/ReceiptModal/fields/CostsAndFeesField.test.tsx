import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'

import type { OrderCostsAndFees } from 'modules/orderCostsAndFees'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { CostsAndFeesField } from './CostsAndFeesField'

jest.mock('react-inlinesvg', () => {
  return function MockSvg() {
    return <svg />
  }
})

jest.mock('modules/orderCostsAndFees', () => ({
  CostsAndFeesBreakdown: () => <div>breakdown</div>,
}))

jest.mock('./FeeField', () => ({
  FeeField: () => <div>legacy fee</div>,
}))

const order = { inputToken: {}, outputToken: {} } as unknown as ParsedOrder

function renderField(ui: ReactNode): ReturnType<typeof render> {
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>)
}

beforeAll(() => {
  i18n.loadAndActivate({ locale: 'en-US', messages: {} })
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

describe('CostsAndFeesField()', () => {
  it('shows the legacy network costs row when the breakdown is unavailable', () => {
    renderField(
      <CostsAndFeesField
        costsAndFees={{ status: 'unavailable' }}
        order={order}
        costsAndFeesTooltip="costs tooltip"
        networkCostsTooltip="network tooltip"
      />,
    )

    expect(screen.getByText('Network fees and costs')).toBeTruthy()
    expect(screen.getByText('legacy fee')).toBeTruthy()
    expect(screen.queryByText('Costs and fees')).toBeNull()
  })

  it('shows the costs and fees label with a placeholder while loading', () => {
    renderField(
      <CostsAndFeesField
        costsAndFees={{ status: 'loading' }}
        order={order}
        costsAndFeesTooltip="costs tooltip"
        networkCostsTooltip="network tooltip"
      />,
    )

    expect(screen.getByText('Costs and fees')).toBeTruthy()
    expect(screen.getByLabelText('Loading')).toBeTruthy()
    expect(screen.queryByText('legacy fee')).toBeNull()
    expect(screen.queryByText('breakdown')).toBeNull()
  })

  it('shows the breakdown when ready', () => {
    renderField(
      <CostsAndFeesField
        costsAndFees={{ status: 'ready', costs: {} as OrderCostsAndFees }}
        order={order}
        costsAndFeesTooltip="costs tooltip"
        networkCostsTooltip="network tooltip"
      />,
    )

    expect(screen.getByText('Costs and fees')).toBeTruthy()
    expect(screen.getByText('breakdown')).toBeTruthy()
    expect(screen.queryByLabelText('Loading')).toBeNull()
    expect(screen.queryByText('legacy fee')).toBeNull()
  })
})
