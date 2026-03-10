import { renderHook } from '@testing-library/react'

import { useSolversFeatureFlag } from '../../hooks/useSolversFeatureFlag'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const { useFlags } = jest.requireMock('launchdarkly-react-client-sdk') as {
  useFlags: jest.Mock
}

describe('useSolversFeatureFlag', () => {
  beforeEach(() => {
    useFlags.mockReset()
  })

  it('defaults to disabled when the LaunchDarkly flag is missing', () => {
    useFlags.mockReturnValue({})

    const { result } = renderHook(() => useSolversFeatureFlag())

    expect(result.current).toBe(false)
  })

  it('returns the LaunchDarkly flag value when provided', () => {
    useFlags.mockReturnValue({ isSolversEnabled: false })

    const { result } = renderHook(() => useSolversFeatureFlag())

    expect(result.current).toBe(false)
  })
})
