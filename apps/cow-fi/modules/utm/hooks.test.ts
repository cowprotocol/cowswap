import { waitForAnalytics } from '@cowprotocol/analytics'

import { act, renderHook } from '@testing-library/react'

import { useInitializeUtm } from './hooks'

jest.mock('@cowprotocol/analytics', () => ({ waitForAnalytics: jest.fn() }))
jest.mock('jotai', () => ({ useSetAtom: () => jest.fn() }))
jest.mock('./state', () => ({ utmAtom: {} }))

jest.mock('@cowprotocol/common-utils', () => jest.requireActual('../../../../libs/common-utils/src/utmParameters'))

const mockReplace = jest.fn()
let mockPathname = '/'
let mockSearchParams = new URLSearchParams('utm_source=ad')

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}))

let finishWaiting: () => void

beforeEach(() => {
  jest.useFakeTimers()
  mockReplace.mockClear()
  mockPathname = '/'
  mockSearchParams = new URLSearchParams('utm_source=ad')
  window.history.replaceState(null, '', '/?utm_source=ad')
  jest.mocked(waitForAnalytics).mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finishWaiting = resolve
      }),
  )
})

afterEach(() => jest.useRealTimers())

async function decide(): Promise<void> {
  await act(async () => {
    finishWaiting()
  })
  act(() => {
    jest.advanceTimersByTime(250)
  })
}

describe('useInitializeUtm delayed cleanup', () => {
  it('keeps the current path, query and fragment after navigating before consent', async () => {
    const { rerender } = renderHook(useInitializeUtm)
    mockPathname = '/learn'
    mockSearchParams = new URLSearchParams('utm_source=ad&category=defi')
    window.history.replaceState(null, '', '/learn?utm_source=ad&category=defi#guides')
    rerender()

    await decide()

    expect(mockReplace).toHaveBeenCalledWith('/learn?category=defi#guides')
  })

  it('does not return to the landing page when the current route has no UTM parameters', async () => {
    const { rerender } = renderHook(useInitializeUtm)
    mockPathname = '/learn'
    mockSearchParams = new URLSearchParams('category=defi')
    rerender()

    await decide()

    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('does not navigate after unmounting while consent is pending', async () => {
    const { unmount } = renderHook(useInitializeUtm)
    unmount()
    await decide()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
