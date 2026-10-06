import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { NATIVE_CURRENCIES, USDC_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fireEvent, render, screen } from '@testing-library/react'

import { PriceChartHeader } from './PriceChartHeader.pure'

import { createSwapChartSymbols } from '../../lib/symbolCatalog'

jest.mock('../ChartSettingsDropdown/ChartSettingsDropdown.container', () => ({ ChartSettingsDropdown: () => null }))

i18n.load('en-US', {})
i18n.activate('en-US')

describe('PriceChartHeader', () => {
  it('shows the latest USD price and period change', () => {
    render(
      <I18nProvider i18n={i18n}>
        <PriceChartHeader
          activeSymbol={undefined}
          change={0.0086}
          metric="price"
          onSelectMetric={jest.fn()}
          onSelectSelection={jest.fn()}
          price={336.5}
          symbols={[]}
        />
      </I18nProvider>,
    )

    expect(screen.getByText('$336.50')).toBeTruthy()
    expect(screen.getByText('+0.86%')).toBeTruthy()
    expect(screen.queryByText('Price chart')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Maximize price chart' })).toBeNull()
  })

  it('selects an asset by its semantic selection', () => {
    const symbols = createSwapChartSymbols(NATIVE_CURRENCIES[SupportedChainId.MAINNET], USDC_MAINNET)
    const onSelectSelection = jest.fn()

    render(
      <I18nProvider i18n={i18n}>
        <PriceChartHeader
          activeSymbol={symbols[0]}
          metric="price"
          onSelectMetric={jest.fn()}
          onSelectSelection={onSelectSelection}
          symbols={symbols}
        />
      </I18nProvider>,
    )

    expect(screen.queryByText('Price chart')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'USDC' }))

    expect(onSelectSelection).toHaveBeenCalledWith('buy')
  })

  it('switches between price and market cap', () => {
    const onSelectMetric = jest.fn()

    render(
      <I18nProvider i18n={i18n}>
        <PriceChartHeader
          activeSymbol={undefined}
          metric="price"
          onSelectMetric={onSelectMetric}
          onSelectSelection={jest.fn()}
          symbols={[]}
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
          activeSymbol={undefined}
          change={0.02}
          metric="marketCap"
          onSelectMetric={jest.fn()}
          onSelectSelection={jest.fn()}
          price={1_230_000_000}
          symbols={[]}
        />
      </I18nProvider>,
    )

    expect(screen.getByText('$1.23B')).toBeTruthy()
  })
})
