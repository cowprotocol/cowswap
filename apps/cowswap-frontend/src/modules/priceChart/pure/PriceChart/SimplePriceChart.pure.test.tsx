import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'

import { SimplePriceChartTooltip } from './SimplePriceChart.pure'

i18n.load('en-US', {})
i18n.activate('en-US')

describe('SimplePriceChartTooltip', () => {
  const data = { placement: 'right' as const, price: 2, time: 1710000000, x: 100, y: 100 }

  it('shows volume when the hovered bar contains it', () => {
    render(
      <I18nProvider i18n={i18n}>
        <SimplePriceChartTooltip data={{ ...data, volume: 123.45 }} metric="price" />
      </I18nProvider>,
    )

    expect(screen.getByText('Volume')).toBeTruthy()
    expect(screen.getByText('$123.45')).toBeTruthy()
  })

  it('hides volume when the hovered bar does not contain it', () => {
    render(
      <I18nProvider i18n={i18n}>
        <SimplePriceChartTooltip data={data} metric="price" />
      </I18nProvider>,
    )

    expect(screen.queryByText('Volume')).toBeNull()
  })
})
