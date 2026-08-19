import { createStore, Provider } from 'jotai'
import { createElement, ReactNode } from 'react'

import { act, renderHook, waitFor } from '@testing-library/react'

import { useTelegramConnect } from './useTelegramConnect'

import { bffTelegramApi } from '../api/bffTelegramApi'

jest.mock('../api/bffTelegramApi')

const mockedApi = bffTelegramApi as jest.Mocked<typeof bffTelegramApi>

function createTestWrapper(): {
  store: ReturnType<typeof createStore>
  wrapper: (props: { children: ReactNode }) => ReactNode
} {
  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => createElement(Provider, { store }, children)
  return { store, wrapper }
}

describe('useTelegramConnect', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('loads the initial connect-status on mount', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: true, username: 'ada' })
    const { wrapper } = createTestWrapper()

    const { result } = renderHook(() => useTelegramConnect('0xabc'), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isSubscribed).toBe(true)
    expect(result.current.username).toBe('ada')
  })

  it('does not fetch status when there is no account', async () => {
    const { wrapper } = createTestWrapper()
    const { result } = renderHook(() => useTelegramConnect(undefined), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedApi.getConnectStatus).not.toHaveBeenCalled()
  })

  it('connect() fetches a token, exposes the deep link, and polls until connected', async () => {
    mockedApi.getConnectStatus.mockResolvedValueOnce({ connected: false })
    mockedApi.getConnectToken.mockResolvedValue({ token: 'tok', deepLink: 'https://t.me/bot?start=tok' })
    mockedApi.getConnectStatus
      .mockResolvedValueOnce({ connected: false }) // first poll tick: still pending
      .mockResolvedValueOnce({ connected: true, username: 'ada' }) // second poll tick: connected

    const { wrapper } = createTestWrapper()
    const { result } = renderHook(() => useTelegramConnect('0xabc'), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.connect()
    })

    expect(result.current.connectState).toBe('connecting')
    expect(result.current.deepLink).toBe('https://t.me/bot?start=tok')

    await act(async () => {
      jest.advanceTimersByTime(3_000)
      await Promise.resolve()
    })
    expect(result.current.isSubscribed).toBe(false)
    expect(result.current.connectState).toBe('connecting')

    await act(async () => {
      jest.advanceTimersByTime(3_000)
      await Promise.resolve()
    })
    expect(result.current.isSubscribed).toBe(true)
    expect(result.current.connectState).toBe('idle')
    expect(result.current.deepLink).toBeNull()
  })

  it('connect() called again while already connecting does not leave the previous timers running', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: false })
    mockedApi.getConnectToken.mockResolvedValue({ token: 'tok', deepLink: 'https://t.me/bot?start=tok' })

    const { wrapper } = createTestWrapper()
    const { result } = renderHook(() => useTelegramConnect('0xabc'), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Simulate a double-click: connect() is invoked again before the first
    // cycle's poll interval or expiry timeout ever fires.
    await act(async () => {
      await result.current.connect()
    })
    await act(async () => {
      await result.current.connect()
    })

    expect(mockedApi.getConnectToken).toHaveBeenCalledTimes(2)

    const callsBeforeAdvance = mockedApi.getConnectStatus.mock.calls.length
    await act(async () => {
      jest.advanceTimersByTime(3_000)
      await Promise.resolve()
    })

    // Only one poll interval should be alive - a leaked first-cycle interval
    // would double this count.
    expect(mockedApi.getConnectStatus.mock.calls.length).toBe(callsBeforeAdvance + 1)

    // cancelConnect() only clears the *current* timer refs. If the first
    // connect() cycle's interval had been orphaned (not cleared by the
    // second connect() call), it would keep polling here even after cancel.
    act(() => {
      result.current.cancelConnect()
    })
    const callsAfterCancel = mockedApi.getConnectStatus.mock.calls.length
    await act(async () => {
      jest.advanceTimersByTime(3 * 3_000)
      await Promise.resolve()
    })
    expect(mockedApi.getConnectStatus.mock.calls.length).toBe(callsAfterCancel)
  })

  it('connect() moves to "expired" after the connect timeout elapses without success', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: false })
    mockedApi.getConnectToken.mockResolvedValue({ token: 'tok', deepLink: 'https://t.me/bot?start=tok' })

    const { wrapper } = createTestWrapper()
    const { result } = renderHook(() => useTelegramConnect('0xabc'), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.connect()
    })

    await act(async () => {
      jest.advanceTimersByTime(10 * 60 * 1000)
      await Promise.resolve()
    })

    expect(result.current.connectState).toBe('expired')
    expect(result.current.deepLink).toBeNull()
  })

  it('connect() moves to "error" when getConnectToken rejects, without an unhandled rejection', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedApi.getConnectStatus.mockResolvedValue({ connected: false })
    mockedApi.getConnectToken.mockRejectedValue(new Error('bff unreachable'))

    const { wrapper } = createTestWrapper()
    const { result } = renderHook(() => useTelegramConnect('0xabc'), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      // connect() must not reject - the hook is responsible for catching the
      // getConnectToken failure and surfacing it via connectState instead.
      await result.current.connect()
    })

    expect(result.current.connectState).toBe('error')
    expect(result.current.deepLink).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('cancelConnect() stops polling and resets to idle', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: false })
    mockedApi.getConnectToken.mockResolvedValue({ token: 'tok', deepLink: 'https://t.me/bot?start=tok' })

    const { wrapper } = createTestWrapper()
    const { result } = renderHook(() => useTelegramConnect('0xabc'), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.connect()
    })
    act(() => {
      result.current.cancelConnect()
    })

    expect(result.current.connectState).toBe('idle')
    expect(result.current.deepLink).toBeNull()

    const callsBeforeAdvance = mockedApi.getConnectStatus.mock.calls.length
    await act(async () => {
      jest.advanceTimersByTime(10_000)
      await Promise.resolve()
    })
    expect(mockedApi.getConnectStatus.mock.calls.length).toBe(callsBeforeAdvance)
  })

  it('disconnect() calls the API and flips isSubscribed off', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: true, username: 'ada' })
    mockedApi.disconnect.mockResolvedValue(undefined)

    const { wrapper } = createTestWrapper()
    const { result } = renderHook(() => useTelegramConnect('0xabc'), { wrapper })
    await waitFor(() => expect(result.current.isSubscribed).toBe(true))

    await act(async () => {
      await result.current.disconnect()
    })

    expect(mockedApi.disconnect).toHaveBeenCalledWith('0xabc')
    expect(result.current.isSubscribed).toBe(false)
  })

  it('disconnect() rejecting leaves the subscribed state untouched', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: true, username: 'ada' })
    mockedApi.disconnect.mockRejectedValue(new Error('failed to disconnect'))

    const { wrapper } = createTestWrapper()
    const { result } = renderHook(() => useTelegramConnect('0xabc'), { wrapper })
    await waitFor(() => expect(result.current.isSubscribed).toBe(true))

    await act(async () => {
      await expect(result.current.disconnect()).rejects.toThrow('failed to disconnect')
    })

    expect(result.current.isSubscribed).toBe(true)
  })

  it('shares subscription state across two hook instances via the atom store', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: true, username: 'ada' })
    const { wrapper } = createTestWrapper()

    const first = renderHook(() => useTelegramConnect('0xabc'), { wrapper })
    await waitFor(() => expect(first.result.current.isSubscribed).toBe(true))

    // A second instance for the same account (e.g. the sidebar remounting)
    // should see the cached subscribed state immediately, not flash "false"
    // while its own fetch is in flight.
    const second = renderHook(() => useTelegramConnect('0xabc'), { wrapper })
    expect(second.result.current.isSubscribed).toBe(true)
    expect(second.result.current.username).toBe('ada')

    // Flush the second instance's own background refresh (it resolves to the
    // same cached value) so it doesn't update state outside of act() after
    // this test completes.
    await act(async () => {
      await Promise.resolve()
    })
  })

  it('resets connectState/deepLink when the account changes mid-connect', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: false })
    mockedApi.getConnectToken.mockResolvedValue({ token: 'tok', deepLink: 'https://t.me/bot?start=tok' })
    const { wrapper } = createTestWrapper()

    const { result, rerender } = renderHook(({ account }) => useTelegramConnect(account), {
      wrapper,
      initialProps: { account: '0xabc' as string | undefined },
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.connect()
    })
    expect(result.current.connectState).toBe('connecting')
    expect(result.current.deepLink).not.toBeNull()

    await act(async () => {
      rerender({ account: '0xdef' })
      await Promise.resolve()
    })

    expect(result.current.connectState).toBe('idle')
    expect(result.current.deepLink).toBeNull()
  })

  it("a stale poll tick from a previous account's connect() attempt does not clobber a new connect() attempt for the current account", async () => {
    // Reproduces: connect(A) starts polling -> A's poll tick fires and calls
    // getConnectStatus('A'), but we don't let that call resolve yet -> account
    // switches to B (resetting A's connect flow) -> connect(B) starts a brand
    // new poll/expiry cycle -> THEN A's still in-flight poll call resolves
    // { connected: true }. Since the poll interval that issued that call was
    // bound to A's connect() closure (accountAtCall === 'A'), its `.then()`
    // must ignore the result once accountRef.current has diverged (now 'B'),
    // instead of tearing down B's brand new connect state.
    //
    // The stale call has to still be "in flight" when the account switches -
    // achieved here by deferring its resolution with a manually-controlled
    // promise instead of letting jest fast-forward past it.
    let resolveStaleAPoll: (value: { connected: boolean }) => void = () => undefined
    const staleAPollPromise = new Promise<{ connected: boolean }>((resolve) => {
      resolveStaleAPoll = resolve
    })

    mockedApi.getConnectToken.mockImplementation(async (acct: string) => ({
      token: `tok-${acct}`,
      deepLink: `https://t.me/bot?start=${acct}`,
    }))

    mockedApi.getConnectStatus
      .mockImplementationOnce(async () => ({ connected: false })) // mount status check for account A
      .mockImplementationOnce(() => staleAPollPromise) // A's poll tick - deliberately left pending
      .mockImplementationOnce(async () => ({ connected: false })) // mount status check for account B
      .mockImplementationOnce(async () => ({ connected: true })) // B's own poll tick - the real success

    const { wrapper } = createTestWrapper()
    const { result, rerender } = renderHook(({ account }) => useTelegramConnect(account), {
      wrapper,
      initialProps: { account: '0xaaa' as string | undefined },
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Start connecting account A.
    await act(async () => {
      await result.current.connect()
    })
    expect(result.current.connectState).toBe('connecting')
    expect(result.current.deepLink).toBe('https://t.me/bot?start=0xaaa')

    // A's poll interval fires and issues its getConnectStatus('0xaaa') call,
    // which we're holding pending via staleAPollPromise.
    await act(async () => {
      jest.advanceTimersByTime(3_000)
      await Promise.resolve()
    })

    // Switch the wallet to account B *before* A's stale poll call resolves.
    // This resets A's connect flow to idle (existing behaviour, covered by
    // the previous test) and kicks off B's own mount status check.
    await act(async () => {
      rerender({ account: '0xbbb' })
      await Promise.resolve()
    })
    expect(result.current.connectState).toBe('idle')
    expect(result.current.deepLink).toBeNull()

    // Start connecting account B - a brand new token, poll interval, and
    // expiry timer.
    await act(async () => {
      await result.current.connect()
    })
    expect(result.current.connectState).toBe('connecting')
    expect(result.current.deepLink).toBe('https://t.me/bot?start=0xbbb')

    // Now let A's stale poll call resolve with connected: true. Without the
    // accountRef.current === accountAtCall guard, this would incorrectly stop
    // B's brand new polling/expiry timers and reset B's connectState/deepLink.
    await act(async () => {
      resolveStaleAPoll({ connected: true })
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(result.current.connectState).toBe('connecting')
    expect(result.current.deepLink).toBe('https://t.me/bot?start=0xbbb')

    // B's own poll tick still correctly resolves the connect flow once B
    // actually connects.
    await act(async () => {
      jest.advanceTimersByTime(3_000)
      await Promise.resolve()
    })

    expect(result.current.connectState).toBe('idle')
    expect(result.current.deepLink).toBeNull()
  })
})
