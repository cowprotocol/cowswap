import { ReactNode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { NATIVE_CURRENCIES, USDC_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fireEvent, render, screen } from '@testing-library/react'

import { PriceChartHeader } from './PriceChartHeader.pure'

import { createSwapChartSymbols } from '../../lib/symbolCatalog'

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

  it('toggles between compact and expanded sizes', () => {
    const onToggleExpanded = jest.fn()
    const renderHeader = (isExpanded: boolean): ReactNode => (
      <I18nProvider i18n={i18n}>
        <PriceChartHeader
          activeSymbol={undefined}
          metric="price"
          onSelectMetric={jest.fn()}
          onSelectSelection={jest.fn()}
          sizeControl={{ isExpanded, onToggle: onToggleExpanded }}
          symbols={[]}
        />
      </I18nProvider>
    )
    const { rerender } = render(renderHeader(false))
    const maximizeButton = screen.getByRole('button', { name: 'Maximize price chart' })

    expect(maximizeButton.getAttribute('aria-pressed')).toBe('false')
    expect(maximizeButton.querySelector('svg')).toBeTruthy()

    fireEvent.click(maximizeButton)
    expect(onToggleExpanded).toHaveBeenCalledTimes(1)

    rerender(renderHeader(true))

    const minimizeButton = screen.getByRole('button', { name: 'Minimize price chart' })

    expect(minimizeButton.getAttribute('aria-pressed')).toBe('true')
    expect(minimizeButton.querySelector('svg')).toBeTruthy()
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
