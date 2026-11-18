import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { renderHook } from '@testing-library/react'

import { useWalletAcceptsForeignFeePayer } from 'modules/trade'

import { useSolanaFlowOptions } from './useSolanaFlowOptions'

jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: jest.fn() }))
jest.mock('modules/trade', () => ({ useWalletAcceptsForeignFeePayer: jest.fn() }))

const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const mockUseWalletAcceptsForeignFeePayer = jest.mocked(useWalletAcceptsForeignFeePayer)

beforeEach(() => {
  mockUseWalletAcceptsForeignFeePayer.mockReturnValue(true)
})

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

  // Ledger Live refuses to sign a transaction the sponsor pays for, so the swap has to fall back to
  // a self-paid order rather than fail at the device.
  it('never sponsors while the wallet rejects a foreign fee payer', () => {
    mockUseFeatureFlags.mockReturnValue({ isSolanaSponsoredOrdersEnabled: true })
    mockUseWalletAcceptsForeignFeePayer.mockReturnValue(false)

    const { result } = renderHook(() => useSolanaFlowOptions({ canSponsor: true }))

    expect(result.current.isSponsored).toBe(false)
  })

  it('rebuilds the options when the wallet capability changes', () => {
    mockUseFeatureFlags.mockReturnValue({ isSolanaSponsoredOrdersEnabled: true })

    const { result, rerender } = renderHook(() => useSolanaFlowOptions({ canSponsor: true }))
    expect(result.current.isSponsored).toBe(true)

    mockUseWalletAcceptsForeignFeePayer.mockReturnValue(false)
    rerender()

    expect(result.current.isSponsored).toBe(false)
  })
})
