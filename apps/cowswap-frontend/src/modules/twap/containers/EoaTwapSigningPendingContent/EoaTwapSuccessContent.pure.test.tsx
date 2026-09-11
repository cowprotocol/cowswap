import { ReactElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, screen } from '@testing-library/react'

import { EoaTwapSuccessContent } from './EoaTwapSuccessContent.pure'

function renderSuccessContent(ui: ReactElement): ReturnType<typeof render> {
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>)
}

describe('EoaTwapSuccessContent()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('renders the success copy and actions', () => {
    const onNewTrade = jest.fn()
    const onViewOrders = jest.fn()

    renderSuccessContent(
      <EoaTwapSuccessContent
        explorerUrl="https://explorer.cow.fi/orders/0xorder"
        onNewTrade={onNewTrade}
        onViewOrders={onViewOrders}
      />,
    )

    expect(screen.getByText('Your TWAP is active')).toBeTruthy()
    expect(screen.getByText('Track its progress in Orders.')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Open in CoW Explorer/ }).getAttribute('href')).toBe(
      'https://explorer.cow.fi/orders/0xorder',
    )

    fireEvent.click(screen.getByRole('button', { name: 'New trade' }))
    expect(onNewTrade).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'View in Orders' }))
    expect(onViewOrders).toHaveBeenCalledTimes(1)
  })

  it('hides the explorer link when no url is provided', () => {
    renderSuccessContent(<EoaTwapSuccessContent onNewTrade={jest.fn()} onViewOrders={jest.fn()} />)

    expect(screen.queryByRole('link', { name: /Open in CoW Explorer/ })).toBeNull()
  })
})
