import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { EoaTwapSuccessContent, EoaTwapSuccessHeading } from './EoaTwapSuccessContent.pure'

jest.mock('modules/trade', () => ({
  BaseTradeConfirmation: ({
    heading,
    children,
  }: {
    heading: { title: ReactElement; subtitle: ReactElement }
    children?: ReactElement
  }) => (
    <div data-testid="base-trade-confirmation">
      <div data-testid="confirmation-success-heading">
        {heading.title}
        {heading.subtitle}
      </div>
      {children}
    </div>
  ),
}))

function renderSuccessContent(ui: ReactElement): ReturnType<typeof render> {
  return render(
    <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
      <I18nProvider i18n={i18n}>{ui}</I18nProvider>
    </StyledComponentsThemeProvider>,
  )
}

describe('EoaTwapSuccessContent()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('renders the success heading without a token pair', () => {
    renderSuccessContent(<EoaTwapSuccessHeading />)

    const heading = screen.getByTestId('confirmation-success-heading')
    expect(heading.textContent).toContain('Your TWAP is active')
    expect(heading.textContent).toContain('Track its progress in Orders.')
    expect(screen.queryByTestId('trade-token-pair')).toBeNull()
  })

  it('renders explorer link and action', () => {
    const onViewOrders = jest.fn()

    renderSuccessContent(
      <EoaTwapSuccessContent explorerUrl="https://explorer.cow.fi/orders/0xorder" onViewOrders={onViewOrders} />,
    )

    expect(screen.getByRole('link', { name: /Open in CoW Explorer/ }).getAttribute('href')).toBe(
      'https://explorer.cow.fi/orders/0xorder',
    )
    expect(screen.queryByRole('button', { name: 'New trade' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'View in Orders' }))
    expect(onViewOrders).toHaveBeenCalledTimes(1)
  })

  it('hides the explorer link when no url is provided', () => {
    renderSuccessContent(<EoaTwapSuccessContent onViewOrders={jest.fn()} />)

    expect(screen.queryByRole('link', { name: /Open in CoW Explorer/ })).toBeNull()
  })
})
