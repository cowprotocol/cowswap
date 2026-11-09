import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useIsSolanaAvailable } from './useIsSolanaAvailable'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

describe('useIsSolanaAvailable', () => {
  it.each`
    solanaVersion | isAlphaNetworksOptionVisible | expected
    ${'beta'}     | ${false}                     | ${true}
    ${'ga'}       | ${false}                     | ${true}
    ${'alpha'}    | ${true}                      | ${true}
    ${'alpha'}    | ${false}                     | ${false}
  `(
    'is $expected with solanaVersion $solanaVersion and the alpha networks option visible $isAlphaNetworksOptionVisible',
    ({ solanaVersion, isAlphaNetworksOptionVisible, expected }) => {
      mockUseFlags.mockReturnValue({ solanaVersion, isAlphaNetworksOptionVisible })

      expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(expected)
    },
  )

  it.each`
    solanaVersion
    ${undefined}
    ${'nonsense'}
    ${true}
  `('falls back to alpha when solanaVersion is $solanaVersion', ({ solanaVersion }) => {
    mockUseFlags.mockReturnValue({ solanaVersion, isAlphaNetworksOptionVisible: false })

    expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(false)
  })

  it('is false inside the widget, even with both flags on', () => {
    mockUseFlags.mockReturnValue({ solanaVersion: 'ga', isAlphaNetworksOptionVisible: true })
    window.location.hash = '#/1/widget/swap'

    try {
      expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(false)
    } finally {
      window.location.hash = ''
    }
  })
})
