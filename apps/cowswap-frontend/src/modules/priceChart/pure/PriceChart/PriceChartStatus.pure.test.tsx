import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'

import { PriceChartStatus } from './PriceChartStatus.pure'

i18n.load('en-US', {})
i18n.activate('en-US')

function renderStatus(kind: 'loading' | 'empty' | 'error'): void {
  render(
    <I18nProvider i18n={i18n}>
      <PriceChartStatus assetSymbol="WETH" kind={kind} />
    </I18nProvider>,
  )
}

describe('PriceChartStatus', () => {
  it('shows an accessible loader while history loads', () => {
    renderStatus('loading')

    expect(screen.getByRole('status', { name: 'Loading price history for WETH' })).toBeTruthy()
    expect(screen.queryByText('Loading price history for WETH')).toBeNull()
  })

  it('shows the base symbol when the complete history is empty', () => {
    renderStatus('empty')

    expect(screen.getByText('Failed to load price history for WETH')).toBeTruthy()
  })

  it('shows a generic message when the request fails', () => {
    renderStatus('error')

    expect(screen.getByText('Service unavailable')).toBeTruthy()
  })
})
