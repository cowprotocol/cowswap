import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { renderHook } from '@testing-library/react'

import { useSolanaFlowOptions } from './useSolanaFlowOptions'

jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: jest.fn() }))

const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>

describe('useSolanaFlowOptions', () => {
  it('defaults every option to false when LaunchDarkly resolved no flags', () => {
    mockUseFeatureFlags.mockReturnValue({})

    const { result } = renderHook(() => useSolanaFlowOptions())

    expect(result.current).toEqual({
      isSponsored: false,
      isAtaCreationDisabled: false,
      isSolanaAppDataEnabled: false,
    })
  })

  it('maps each flag onto its option', () => {
    mockUseFeatureFlags.mockReturnValue({
      isSolanaSponsoredOrdersEnabled: true,
      isAtaCreationDisabled: true,
      isSolanaAppDataEnabled: true,
    })

    const { result } = renderHook(() => useSolanaFlowOptions())

    expect(result.current).toEqual({
      isSponsored: true,
      isAtaCreationDisabled: true,
      isSolanaAppDataEnabled: true,
    })
  })

  // The options object is a dependency of the trade callbacks: a new identity per render would
  // rebuild them on every render of the widget.
  it('keeps the same object across renders while the flags do not change', () => {
    mockUseFeatureFlags.mockReturnValue({ isSolanaAppDataEnabled: true })

    const { result, rerender } = renderHook(() => useSolanaFlowOptions())
    const first = result.current
    rerender()

    expect(result.current).toBe(first)
  })
})
