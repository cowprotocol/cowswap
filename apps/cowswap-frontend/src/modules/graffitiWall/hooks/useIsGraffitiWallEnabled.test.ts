import { getIsSafeAppIframe } from '@cowprotocol/common-utils'

import { renderHook } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useIsGraffitiWallEnabled } from './useIsGraffitiWallEnabled'

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  getIsSafeAppIframe: jest.fn(),
}))

const mockUseFlags = jest.mocked(useFlags)
const mockGetIsSafeAppIframe = jest.mocked(getIsSafeAppIframe)

describe('useIsGraffitiWallEnabled', () => {
  beforeEach(() => {
    mockGetIsSafeAppIframe.mockReturnValue(false)
  })

  it('is off inside a Safe app even when the flag is on', () => {
    mockUseFlags.mockReturnValue({ isGraffitiWallEnabled: true })
    mockGetIsSafeAppIframe.mockReturnValue(true)

    expect(renderHook(() => useIsGraffitiWallEnabled()).result.current).toBe(false)
  })

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
