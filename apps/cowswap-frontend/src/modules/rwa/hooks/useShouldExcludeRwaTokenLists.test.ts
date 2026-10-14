import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { renderHook } from '@testing-library/react'

import { useGeoCountry } from './useGeoCountry'
import { useShouldExcludeRwaTokenLists } from './useShouldExcludeRwaTokenLists'

jest.mock('@cowprotocol/common-hooks', () => ({
  useFeatureFlags: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  isInjectedWidget: jest.fn(),
}))

jest.mock('@cowprotocol/tokens', () => ({
  getCountryAsKey: (country: string) => country.toUpperCase(),
}))

jest.mock('./useGeoCountry', () => ({
  useGeoCountry: jest.fn(),
}))

const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const mockIsInjectedWidget = isInjectedWidget as jest.MockedFunction<typeof isInjectedWidget>
const mockUseGeoCountry = useGeoCountry as jest.MockedFunction<typeof useGeoCountry>

function render(): boolean {
  return renderHook(() => useShouldExcludeRwaTokenLists()).result.current
}

describe('useShouldExcludeRwaTokenLists', () => {
  beforeEach(() => {
    mockUseFeatureFlags.mockReturnValue({ isRwaGeoblockEnabled: true })
    mockIsInjectedWidget.mockReturnValue(false)
    mockUseGeoCountry.mockReturnValue('US')
  })

  it('excludes RWA lists for US users', () => {
    expect(render()).toBe(true)
  })

  it('matches the country code case-insensitively', () => {
    mockUseGeoCountry.mockReturnValue('us')

    expect(render()).toBe(true)
  })

  it('keeps RWA lists for non-US users', () => {
    mockUseGeoCountry.mockReturnValue('DE')

    expect(render()).toBe(false)
  })

  it('keeps RWA lists while the country is unknown', () => {
    mockUseGeoCountry.mockReturnValue(null)

    expect(render()).toBe(false)
  })

  it('keeps RWA lists when the RWA geoblock flag is disabled', () => {
    mockUseFeatureFlags.mockReturnValue({ isRwaGeoblockEnabled: false })

    expect(render()).toBe(false)
  })

  it('keeps RWA lists inside the injected widget', () => {
    mockIsInjectedWidget.mockReturnValue(true)

    expect(render()).toBe(false)
  })
})
