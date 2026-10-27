import { USDC_MAINNET } from '@cowprotocol/common-const'

import { renderHook } from '@testing-library/react'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'

import { usePriceChartVisibility } from './usePriceChartVisibility'

jest.mock('@cowprotocol/common-hooks', () => ({
  useFeatureFlags: () => ({ isPriceChartEnabled: true }),
  useMediaQuery: () => true,
}))
jest.mock('entities/injectedWidget', () => ({ useInjectedWidgetParams: () => ({}) }))
jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({ useIsProviderNetworkUnsupported: () => false }))
jest.mock('common/hooks/useIsProviderNetworkDeprecated', () => ({ useIsProviderNetworkDeprecated: jest.fn() }))

const mockUseIsProviderNetworkDeprecated = useIsProviderNetworkDeprecated as jest.MockedFunction<
  typeof useIsProviderNetworkDeprecated
>

describe('usePriceChartVisibility', () => {
  it('shows the chart on an active network', () => {
    mockUseIsProviderNetworkDeprecated.mockReturnValue(false)

    const { result } = renderHook(() => usePriceChartVisibility(USDC_MAINNET, null))

    expect(result.current).toBe(true)
  })

  it('hides the chart on a deprecated network', () => {
    mockUseIsProviderNetworkDeprecated.mockReturnValue(true)

    const { result } = renderHook(() => usePriceChartVisibility(USDC_MAINNET, null))

    expect(result.current).toBe(false)
  })
})
