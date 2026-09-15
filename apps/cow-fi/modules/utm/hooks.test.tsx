/** @jest-environment jsdom */

import { waitForAnalytics } from '@cowprotocol/analytics'

import { act, renderHook } from '@testing-library/react'

import { useInitializeUtm } from './hooks'

const mockReplace = jest.fn()
const mockSetUtm = jest.fn()

jest.mock('@cowprotocol/analytics', () => ({
  waitForAnalytics: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  getUtmParams: (query: URLSearchParams) => ({
    utmMedium: query.get('utm_medium') ?? undefined,
    utmSource: query.get('utm_source') ?? undefined,
  }),
  hasUtmCodes: (utm: Record<string, string | undefined>) => Object.values(utm).some(Boolean),
}))

jest.mock('jotai', () => ({
  useAtomValue: jest.fn(),
  useSetAtom: () => mockSetUtm,
}))

jest.mock('next/navigation', () => ({
  usePathname: () => '/learn',
  useRouter: () => ({ replace: mockReplace }),
}))

const mockWaitForAnalytics = jest.mocked(waitForAnalytics)

describe('useInitializeUtm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockWaitForAnalytics.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('reads UTM parameters from the browser URL without using Next search params', async () => {
    window.history.replaceState({}, '', '/learn?utm_source=newsletter&utm_medium=email&ref=keep')

    renderHook(() => useInitializeUtm())

    expect(mockSetUtm).toHaveBeenCalledWith({
      utmMedium: 'email',
      utmSource: 'newsletter',
    })
    expect(mockWaitForAnalytics).toHaveBeenCalledTimes(1)

    await act(async () => {
      await Promise.resolve()
    })
    act(() => {
      jest.advanceTimersByTime(250)
    })

    expect(mockReplace).toHaveBeenCalledWith('/learn?ref=keep')
  })
})
