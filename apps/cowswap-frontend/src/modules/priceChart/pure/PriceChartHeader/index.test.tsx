import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { NATIVE_CURRENCIES, USDC_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fireEvent, render, screen } from '@testing-library/react'

import { PriceChartHeader } from '.'

jest.mock('../ChartSettingsDropdown', () => ({ ChartSettingsDropdown: () => null }))

i18n.load('en-US', {})
i18n.activate('en-US')

describe('PriceChartHeader', () => {
  it('shows the latest USD price and period change', () => {
    render(
      <I18nProvider i18n={i18n}>
        <PriceChartHeader
          activeCurrency={undefined}
          change={0.0086}
          metric="price"
          onSelectMetric={jest.fn()}
          onSelectCurrency={jest.fn()}
          price={336.5}
          currencies={[]}
        />
      </I18nProvider>,
    )

    expect(screen.getByText('$336.50')).toBeTruthy()
    expect(screen.getByText('+0.86%')).toBeTruthy()
    expect(screen.queryByText('Price chart')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Maximize price chart' })).toBeNull()
  })

  it('selects a token asset', () => {
    const currencies = [NATIVE_CURRENCIES[SupportedChainId.MAINNET], USDC_MAINNET]
    const onSelectCurrency = jest.fn()

    render(
      <I18nProvider i18n={i18n}>
        <PriceChartHeader
          activeCurrency={currencies[0]}
          metric="price"
          onSelectMetric={jest.fn()}
          onSelectCurrency={onSelectCurrency}
          currencies={currencies}
        />
      </I18nProvider>,
    )

    expect(screen.queryByText('Price chart')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'USDC' }))

    expect(onSelectCurrency).toHaveBeenCalledWith(currencies[1])
  })

  it('switches between price and market cap', () => {
    const onSelectMetric = jest.fn()

    render(
      <I18nProvider i18n={i18n}>
        <PriceChartHeader
          activeCurrency={undefined}
          metric="price"
          onSelectMetric={onSelectMetric}
          onSelectCurrency={jest.fn()}
          currencies={[]}
        />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Market Cap' }))

    expect(onSelectMetric).toHaveBeenCalledWith('marketCap')
  })

  it('formats market cap as a compact USD value', () => {
    render(
      <I18nProvider i18n={i18n}>
        <PriceChartHeader
          activeCurrency={undefined}
          change={0.02}
          metric="marketCap"
          onSelectMetric={jest.fn()}
          onSelectCurrency={jest.fn()}
          price={1_230_000_000}
          currencies={[]}
        />
      </I18nProvider>,
    )

    expect(screen.getByText('$1.23B')).toBeTruthy()
  })
})
