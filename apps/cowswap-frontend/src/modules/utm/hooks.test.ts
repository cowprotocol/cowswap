import { waitForAnalytics } from '@cowprotocol/analytics'

import { act, renderHook } from '@testing-library/react'

import { useInitializeUtm } from './hooks'

jest.mock('@cowprotocol/analytics', () => ({ waitForAnalytics: jest.fn(), __resetGtmInstance: jest.fn() }))
const mockSetUtm = jest.fn()

jest.mock('jotai', () => ({ useSetAtom: () => mockSetUtm }))
jest.mock('./state', () => ({ utmAtom: {} }))

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  isInjectedWidget: () => false,
}))

const mockNavigate = jest.fn()
let mockLocation = { pathname: '/1/swap/WETH/COW', search: '?utm_source=ad', hash: '' }

jest.mock('react-router', () => ({ useLocation: () => mockLocation }))
jest.mock('common/hooks/useNavigate', () => ({ useNavigate: () => mockNavigate }))

let finishWaiting: () => void

beforeEach(() => {
  jest.useFakeTimers()
  mockNavigate.mockClear()
  mockSetUtm.mockClear()
  mockLocation = { pathname: '/1/swap/WETH/COW', search: '?utm_source=ad', hash: '' }
  window.history.replaceState(null, '', '/#/1/swap/WETH/COW?utm_source=ad')
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
  it('keeps the current route, tokens and non-UTM parameters after navigating before consent', async () => {
    const { rerender } = renderHook(useInitializeUtm)
    mockLocation = { pathname: '/1/limit/USDC/WETH', search: '?utm_source=ad&limitPrice=123', hash: '#details' }
    rerender()

    await decide()

    expect(mockNavigate).toHaveBeenCalledWith(
      { pathname: '/1/limit/USDC/WETH', search: 'limitPrice=123', hash: '#details' },
      { replace: true },
    )
  })

  it('does not restore landing parameters when the current route has no UTM parameters', async () => {
    const { rerender } = renderHook(useInitializeUtm)
    mockLocation = { pathname: '/1/limit/USDC/WETH', search: '?limitPrice=456', hash: '' }
    rerender()

    await decide()

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('cleans both query locations while preserving the current hash route', async () => {
    window.history.replaceState(null, '', '/?utm_source=ad&ref=keep#/1/swap/WETH/COW')
    const { rerender } = renderHook(useInitializeUtm)
    mockLocation = { pathname: '/1/limit/USDC/WETH', search: '?utm_medium=email&limitPrice=789', hash: '' }
    window.history.replaceState(null, '', '/?utm_source=ad&ref=keep#/1/limit/USDC/WETH?utm_medium=email&limitPrice=789')
    rerender()

    await decide()

    expect(mockNavigate).toHaveBeenCalledWith(
      { pathname: '/1/limit/USDC/WETH', search: 'limitPrice=789&ref=keep', hash: '' },
      { replace: true },
    )
    expect(window.location.search).toBe('')
    expect(window.location.hash).toBe('#/1/limit/USDC/WETH?limitPrice=789&ref=keep')
  })

  it('stores UTM values that arrive while consent is pending', async () => {
    const { rerender } = renderHook(useInitializeUtm)
    mockLocation = { pathname: '/1/swap/WETH/COW', search: '?utm_source=ad&utm_medium=email', hash: '' }
    window.history.replaceState(null, '', '/#/1/swap/WETH/COW?utm_source=ad&utm_medium=email')
    rerender()

    await decide()

    expect(mockSetUtm).toHaveBeenLastCalledWith({ utmSource: 'ad', utmMedium: 'email' })
  })

  it('removes a UTM parameter whose key is percent-encoded in the route query', async () => {
    window.history.replaceState(null, '', '/?ref=keep#/1/swap/WETH/COW?ut%6d_source=ad')
    mockLocation = { pathname: '/1/swap/WETH/COW', search: '?ut%6d_source=ad', hash: '' }
    renderHook(useInitializeUtm)

    await decide()

    expect(window.location.hash).toBe('#/1/swap/WETH/COW?ref=keep')
  })

  it('does not navigate after unmounting while consent is pending', async () => {
    const { unmount } = renderHook(useInitializeUtm)
    unmount()
    await decide()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
