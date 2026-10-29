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

  it('maps each flag onto its option for a surface that can sponsor', () => {
    mockUseFeatureFlags.mockReturnValue({
      isSolanaSponsoredOrdersEnabled: true,
      isAtaCreationDisabled: true,
      isSolanaAppDataEnabled: true,
    })

    const { result } = renderHook(() => useSolanaFlowOptions({ canSponsor: true }))

    expect(result.current).toEqual({
      isSponsored: true,
      isAtaCreationDisabled: true,
      isSolanaAppDataEnabled: true,
    })
  })

  // Only the swap flow reaches `planCreateOrderStep`, which is what consumes the sponsor; a sponsored
  // limit order would also switch the wallet prompt and the submission path.
  it('never sponsors a surface that cannot, however the flag is set', () => {
    mockUseFeatureFlags.mockReturnValue({ isSolanaSponsoredOrdersEnabled: true })

    const { result } = renderHook(() => useSolanaFlowOptions())

    expect(result.current.isSponsored).toBe(false)
  })

  // The options object is a dependency of the trade callbacks: a new identity per render would
  // rebuild them on every render of the widget.
  it('keeps the same object across renders while the flags do not change', () => {
    mockUseFeatureFlags.mockReturnValue({ isSolanaAppDataEnabled: true })

    const { result, rerender } = renderHook(() => useSolanaFlowOptions({ canSponsor: true }))
    const first = result.current
    rerender()

    expect(result.current).toBe(first)
  })
})
