import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useIsSolanaAvailable } from './useIsSolanaAvailable'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

describe('useIsSolanaAvailable', () => {
  it.each`
    isSolanaEnabled | isSolanaBeta | expected
    ${true}         | ${false}     | ${true}
    ${false}        | ${true}      | ${true}
    ${true}         | ${true}      | ${true}
    ${false}        | ${false}     | ${false}
    ${undefined}    | ${undefined} | ${false}
  `(
    'is $expected with isSolanaEnabled $isSolanaEnabled and isSolanaBeta $isSolanaBeta',
    ({ isSolanaEnabled, isSolanaBeta, expected }) => {
      mockUseFlags.mockReturnValue({ isSolanaEnabled, isSolanaBeta })

      expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(expected)
    },
  )

  it('is false inside the widget, even with both flags on', () => {
    mockUseFlags.mockReturnValue({ isSolanaEnabled: true, isSolanaBeta: true })
    window.location.hash = '#/1/widget/swap'

    try {
      expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(false)
    } finally {
      window.location.hash = ''
    }
  })
})
