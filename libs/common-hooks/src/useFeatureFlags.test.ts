import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useFeatureFlags } from './useFeatureFlags'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

const LD_FLAGS = { isSolanaEnabled: true, isSolBridgeEnabled: true, isTwapEoaEnabled: true }

describe('useFeatureFlags', () => {
  beforeEach(() => {
    mockUseFlags.mockReturnValue(LD_FLAGS)
  })

  afterEach(() => {
    window.location.hash = ''
  })

  it('returns LaunchDarkly flags as is outside the widget', () => {
    const { result } = renderHook(() => useFeatureFlags())

    expect(result.current).toBe(LD_FLAGS)
  })

  it('forces every Solana flag off inside the widget and keeps the rest, including bridging to Solana', () => {
    window.location.hash = '#/1/widget/swap'

    const { result } = renderHook(() => useFeatureFlags())

    expect(result.current).toEqual({
      isSolanaEnabled: false,
      isAlphaNetworksOptionVisible: false,
      isSolanaPublicLaunched: false,
      isSolBridgeEnabled: true,
      isTwapEoaEnabled: true,
    })
  })
})

describe('useFeatureFlags with REACT_APP_FEATURE_FLAGS', () => {
  const originalValue = process.env.REACT_APP_FEATURE_FLAGS

  beforeEach(() => {
    mockUseFlags.mockReturnValue(LD_FLAGS)
  })

  afterEach(() => {
    if (originalValue === undefined) delete process.env.REACT_APP_FEATURE_FLAGS
    else process.env.REACT_APP_FEATURE_FLAGS = originalValue
  })

  it('merges env overrides over unresolved LaunchDarkly flags', () => {
    process.env.REACT_APP_FEATURE_FLAGS = '{"isSolanaThemeEnabled":true,"isTwapEoaEnabled":false}'

    const { result } = renderHook(() => useFeatureFlags())

    expect(result.current).toEqual({
      ...LD_FLAGS,
      isSolanaThemeEnabled: true,
      isTwapEoaEnabled: false,
    })
  })

  it('ignores malformed JSON', () => {
    process.env.REACT_APP_FEATURE_FLAGS = 'not json'

    const { result } = renderHook(() => useFeatureFlags())

    expect(result.current).toBe(LD_FLAGS)
  })
})
