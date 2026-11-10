import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useIsSolanaBeta } from './useIsSolanaBeta'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

describe('useIsSolanaBeta', () => {
  it.each`
    isSolanaBeta | expected
    ${true}      | ${true}
    ${false}     | ${false}
    ${undefined} | ${false}
  `('is $expected with isSolanaBeta $isSolanaBeta', ({ isSolanaBeta, expected }) => {
    mockUseFlags.mockReturnValue({ isSolanaBeta })

    expect(renderHook(() => useIsSolanaBeta()).result.current).toBe(expected)
  })

  it('is false inside the widget, even with the flag on', () => {
    mockUseFlags.mockReturnValue({ isSolanaBeta: true })
    window.location.hash = '#/1/widget/swap'

    try {
      expect(renderHook(() => useIsSolanaBeta()).result.current).toBe(false)
    } finally {
      window.location.hash = ''
    }
  })
})
