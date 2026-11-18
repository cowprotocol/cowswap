import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useIsGraffitiWallEnabled } from './useIsGraffitiWallEnabled'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)

describe('useIsGraffitiWallEnabled', () => {
  it.each`
    isGraffitiWallEnabled | expected
    ${true}               | ${true}
    ${false}              | ${false}
    ${undefined}          | ${false}
  `('is $expected when the flag is $isGraffitiWallEnabled', ({ isGraffitiWallEnabled, expected }) => {
    mockUseFlags.mockReturnValue({ isGraffitiWallEnabled })

    expect(renderHook(() => useIsGraffitiWallEnabled()).result.current).toBe(expected)
  })
})
