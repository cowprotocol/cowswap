import { render, screen } from '@testing-library/react'

import { PriceChartSettings } from './PriceChartSettings.container'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'

jest.mock('@cowprotocol/ui', () => ({
  SettingsBox: ({ title }: { title: string }) => <span>{title}</span>,
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
  })

  it('shows both settings when both features are enabled', () => {
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isAdvancedPriceChartEnabled: true,
      isPriceChartEnabled: true,
    })

    render(<PriceChartSettings />)

    expect(screen.getByText('Show price chart')).not.toBeNull()
    expect(screen.getByText('Advanced price chart')).not.toBeNull()
  })
})
