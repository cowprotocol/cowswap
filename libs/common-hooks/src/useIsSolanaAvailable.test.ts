import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useIsSolanaAvailable } from './useIsSolanaAvailable'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

describe('useIsSolanaAvailable', () => {
  it.each`
    isSolanaEnabled | expected
    ${true}         | ${true}
    ${false}        | ${false}
    ${undefined}    | ${false}
  `('is $expected with isSolanaEnabled $isSolanaEnabled', ({ isSolanaEnabled, expected }) => {
    mockUseFlags.mockReturnValue({ isSolanaEnabled })

    expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(expected)
  })

  it('is false inside the widget, even with the flag on', () => {
    mockUseFlags.mockReturnValue({ isSolanaEnabled: true })
    window.location.hash = '#/1/widget/swap'

    try {
      expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(false)
    } finally {
      window.location.hash = ''
    }
  })
})
