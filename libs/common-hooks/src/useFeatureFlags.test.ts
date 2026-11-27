import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useFeatureFlags } from './useFeatureFlags'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

const LD_FLAGS = { isSolBridgeEnabled: true, isTwapEoaEnabled: true }

describe('useFeatureFlags', () => {
  beforeEach(() => {
    mockUseFlags.mockReturnValue(LD_FLAGS)
  })

  it('returns LaunchDarkly flags as is', () => {
    const { result } = renderHook(() => useFeatureFlags())

    expect(result.current).toBe(LD_FLAGS)
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
    process.env.REACT_APP_FEATURE_FLAGS = '{"isWaitForCowsEnabled":true,"isTwapEoaEnabled":false}'

    const { result } = renderHook(() => useFeatureFlags())

    expect(result.current).toEqual({
      ...LD_FLAGS,
      isWaitForCowsEnabled: true,
      isTwapEoaEnabled: false,
    })
  })

  it('ignores malformed JSON', () => {
    process.env.REACT_APP_FEATURE_FLAGS = 'not json'

    const { result } = renderHook(() => useFeatureFlags())

    expect(result.current).toBe(LD_FLAGS)
  })
})
