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

  it('forces Solana and the alpha networks option off inside the widget and keeps the rest, including bridging to Solana', () => {
    window.location.hash = '#/1/widget/swap'

    const { result } = renderHook(() => useFeatureFlags())

    expect(result.current).toEqual({
      isSolanaEnabled: false,
      isAlphaNetworksOptionVisible: false,
      isSolBridgeEnabled: true,
      isTwapEoaEnabled: true,
    })
  })
})
