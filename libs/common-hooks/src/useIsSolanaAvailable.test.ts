import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useIsSolanaAvailable } from './useIsSolanaAvailable'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

describe('useIsSolanaAvailable', () => {
  it.each`
    isSolanaEnabled | isAlphaNetworksOptionVisible | isSolanaBeta | expected
    ${true}         | ${false}                     | ${false}     | ${true}
    ${false}        | ${true}                      | ${false}     | ${true}
    ${false}        | ${false}                     | ${true}      | ${true}
    ${false}        | ${false}                     | ${false}     | ${false}
    ${undefined}    | ${undefined}                 | ${undefined} | ${false}
  `(
    'is $expected with isSolanaEnabled $isSolanaEnabled, alpha option $isAlphaNetworksOptionVisible, beta $isSolanaBeta',
    ({ isSolanaEnabled, isAlphaNetworksOptionVisible, isSolanaBeta, expected }) => {
      mockUseFlags.mockReturnValue({ isSolanaEnabled, isAlphaNetworksOptionVisible, isSolanaBeta })

      expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(expected)
    },
  )

  it('is false inside the widget, even with all three flags on', () => {
    mockUseFlags.mockReturnValue({ isSolanaEnabled: true, isAlphaNetworksOptionVisible: true, isSolanaBeta: true })
    window.location.hash = '#/1/widget/swap'

    try {
      expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(false)
    } finally {
      window.location.hash = ''
    }
  })
})
