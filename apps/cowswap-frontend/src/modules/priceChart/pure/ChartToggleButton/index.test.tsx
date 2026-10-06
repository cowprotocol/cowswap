import { render, screen } from '@testing-library/react'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'

import { ChartToggleButton } from '.'

jest.mock('../../hooks/usePriceChartFeatureFlags', () => ({
  usePriceChartFeatureFlags: jest.fn(),
}))

const usePriceChartFeatureFlagsMock = usePriceChartFeatureFlags as jest.MockedFunction<typeof usePriceChartFeatureFlags>

describe('ChartToggleButton', () => {
  it('is hidden when price charts are disabled', () => {
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isPriceChartEnabled: false,
    })

    render(<ChartToggleButton />)

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('is shown when price charts are enabled', () => {
    usePriceChartFeatureFlagsMock.mockReturnValue({
      isPriceChartEnabled: true,
    })

    render(<ChartToggleButton />)

    expect(screen.getByRole('button')).not.toBeNull()
  })
})
