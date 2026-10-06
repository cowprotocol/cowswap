import { renderHook } from '@testing-library/react'

import { usePriceChartFeatureFlags } from './usePriceChartFeatureFlags'

describe('usePriceChartFeatureFlags', () => {
  it('enables both charts', () => {
    expect(renderHook(usePriceChartFeatureFlags).result.current).toEqual({
      isAdvancedPriceChartEnabled: true,
      isPriceChartEnabled: true,
    })
  })
})
