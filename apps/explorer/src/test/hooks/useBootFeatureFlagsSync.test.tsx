import { renderHook } from '@testing-library/react'

import { useBootFeatureFlagsSync } from '../../hooks/useBootFeatureFlagsSync'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
  useLDClient: jest.fn(),
}))

jest.mock('@cowprotocol/common-const', () => ({
  syncBootFeatureFlags: jest.fn(),
}))

const { useFlags, useLDClient } = jest.requireMock('launchdarkly-react-client-sdk') as {
  useFlags: jest.Mock
  useLDClient: jest.Mock
}

const { syncBootFeatureFlags } = jest.requireMock('@cowprotocol/common-const') as {
  syncBootFeatureFlags: jest.Mock
}

describe('useBootFeatureFlagsSync', () => {
  beforeEach(() => {
    useFlags.mockReset()
    useLDClient.mockReset()
    syncBootFeatureFlags.mockReset()
  })

  it('persists the flags once LaunchDarkly has resolved', () => {
    useLDClient.mockReturnValue({})
    useFlags.mockReturnValue({ isSolanaEnabled: true })

    renderHook(() => useBootFeatureFlagsSync())

    expect(syncBootFeatureFlags).toHaveBeenCalledWith({ isSolanaEnabled: true })
  })

  // Writing before the client exists would persist `false` and undo an earlier `true`, which
  // `syncBootFeatureFlags` follows with a navigation — on every visit.
  it('writes nothing while the client is missing', () => {
    useLDClient.mockReturnValue(undefined)
    useFlags.mockReturnValue({})

    renderHook(() => useBootFeatureFlagsSync())

    expect(syncBootFeatureFlags).not.toHaveBeenCalled()
  })

  it('persists a resolved disabled flag, so turning it off takes effect', () => {
    useLDClient.mockReturnValue({})
    useFlags.mockReturnValue({ isSolanaEnabled: false })

    renderHook(() => useBootFeatureFlagsSync())

    expect(syncBootFeatureFlags).toHaveBeenCalledWith({ isSolanaEnabled: false })
  })
})
