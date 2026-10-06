import { render, screen } from '@testing-library/react'

import { ChartToggleButton } from './ChartToggleButton.container'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'

jest.mock('../../hooks/usePriceChartFeatureFlags', () => ({
  usePriceChartFeatureFlags: jest.fn(),
}))

const usePriceChartFeatureFlagsMock = usePriceChartFeatureFlags as jest.MockedFunction<typeof usePriceChartFeatureFlags>

describe('ChartToggleButton', () => {
  it('is hidden when price charts are disabled', () => {
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isAdvancedPriceChartEnabled: false,
      isPriceChartEnabled: false,
    })

    render(<ChartToggleButton />)

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('is shown when price charts are enabled', () => {
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isAdvancedPriceChartEnabled: false,
      isPriceChartEnabled: true,
    })

    render(<ChartToggleButton />)

    expect(screen.getByRole('button')).not.toBeNull()
  })
})
