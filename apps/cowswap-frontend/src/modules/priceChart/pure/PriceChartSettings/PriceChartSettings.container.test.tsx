import { fireEvent, render, screen } from '@testing-library/react'

import { PriceChartSettings } from './PriceChartSettings.container'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'

jest.mock('@cowprotocol/ui', () => ({
  SettingsBox: ({
    checked,
    title,
    toggle,
    tooltip,
  }: {
    checked: boolean
    title: string
    toggle: () => void
    tooltip: string
  }) => (
    <button aria-pressed={checked} onClick={toggle} title={tooltip}>
      {title}
    </button>
  ),
}))

jest.mock('../../hooks/usePriceChartFeatureFlags', () => ({
  usePriceChartFeatureFlags: jest.fn(),
}))

const usePriceChartFeatureFlagsMock = usePriceChartFeatureFlags as jest.MockedFunction<typeof usePriceChartFeatureFlags>

describe('PriceChartSettings', () => {
  it('hides all settings when price charts are disabled', () => {
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isAdvancedPriceChartEnabled: false,
      isPriceChartEnabled: false,
    })

    render(<PriceChartSettings />)

    expect(screen.queryByText('Show price chart')).toBeNull()
  })

  it('hides only the Advanced setting when Advanced is disabled', () => {
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isAdvancedPriceChartEnabled: false,
      isPriceChartEnabled: true,
    })

    render(<PriceChartSettings />)

    expect(screen.getByText('Show price chart')).not.toBeNull()
    expect(screen.queryByText('Advanced price chart')).toBeNull()
    expect(screen.getByText('Total supply for Market Cap')).not.toBeNull()
  })

  it('shows chart settings and switches the Market Cap supply basis', () => {
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isAdvancedPriceChartEnabled: true,
      isPriceChartEnabled: true,
    })

    render(<PriceChartSettings />)

    expect(screen.getByText('Show price chart')).not.toBeNull()
    expect(screen.getByText('Advanced price chart')).not.toBeNull()
    const supplySetting = screen.getByRole('button', { name: 'Total supply for Market Cap' })

    expect(supplySetting.getAttribute('title')).toContain('Market Cap is an approximation')
    expect(supplySetting.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(supplySetting)
    expect(supplySetting.getAttribute('aria-pressed')).toBe('true')
  })
})
