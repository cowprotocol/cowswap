import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useIsSolanaAvailable } from './useIsSolanaAvailable'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

describe('useIsSolanaAvailable', () => {
  it.each`
    isSolanaEnabled | isAlphaNetworksOptionVisible | expected
    ${true}         | ${false}                     | ${true}
    ${false}        | ${true}                      | ${true}
    ${false}        | ${false}                     | ${false}
  `(
    'is $expected with isSolanaEnabled $isSolanaEnabled and the alpha networks option visible $isAlphaNetworksOptionVisible',
    ({ isSolanaEnabled, isAlphaNetworksOptionVisible, expected }) => {
      mockUseFlags.mockReturnValue({ isSolanaEnabled, isAlphaNetworksOptionVisible })

      expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(expected)
    },
  )

  it('is false inside the widget, even with both flags on', () => {
    mockUseFlags.mockReturnValue({ isSolanaEnabled: true, isAlphaNetworksOptionVisible: true })
    window.location.hash = '#/1/widget/swap'

    try {
      expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(false)
    } finally {
      window.location.hash = ''
    }
  })
})
