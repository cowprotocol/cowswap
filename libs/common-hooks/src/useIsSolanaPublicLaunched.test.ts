import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useIsSolanaPublicLaunched } from './useIsSolanaPublicLaunched'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

describe('useIsSolanaPublicLaunched', () => {
  it.each`
    isSolanaPublicLaunched | expected
    ${true}                | ${true}
    ${false}               | ${false}
    ${undefined}           | ${false}
  `('is $expected with isSolanaPublicLaunched $isSolanaPublicLaunched', ({ isSolanaPublicLaunched, expected }) => {
    mockUseFlags.mockReturnValue({ isSolanaPublicLaunched })

    expect(renderHook(() => useIsSolanaPublicLaunched()).result.current).toBe(expected)
  })

  it('is false inside the widget, even with the flag on', () => {
    mockUseFlags.mockReturnValue({ isSolanaPublicLaunched: true })
    window.location.hash = '#/1/widget/swap'

    try {
      expect(renderHook(() => useIsSolanaPublicLaunched()).result.current).toBe(false)
    } finally {
      window.location.hash = ''
    }
  })
})
