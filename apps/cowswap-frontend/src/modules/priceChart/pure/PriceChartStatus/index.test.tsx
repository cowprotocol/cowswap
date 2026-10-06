import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'

import { PriceChartStatus } from '.'

i18n.load('en-US', {})
i18n.activate('en-US')

function renderStatus({ isPending = false, isError = false }: { isPending?: boolean; isError?: boolean } = {}): void {
  render(
    <I18nProvider i18n={i18n}>
      <PriceChartStatus assetSymbol="WETH" isPending={isPending} isError={isError} />
    </I18nProvider>,
  )
}

describe('PriceChartStatus', () => {
  it('shows an accessible loader while history loads', () => {
    renderStatus({ isPending: true })

    expect(screen.getByRole('status', { name: 'Loading price history for WETH' })).toBeTruthy()
    expect(screen.queryByText('Loading price history for WETH')).toBeNull()
  })

  it('shows the base asset when the complete history is empty', () => {
    renderStatus()

    expect(screen.getByText('Failed to load price history for WETH')).toBeTruthy()
  })

  it('shows a generic message when the request fails', () => {
    renderStatus({ isError: true })

    expect(screen.getByText('Service unavailable')).toBeTruthy()
  })
})
