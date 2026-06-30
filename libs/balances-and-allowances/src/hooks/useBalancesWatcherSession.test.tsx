import { Provider, useAtomValue } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React, { ReactNode } from 'react'

import { NATIVE_CURRENCY_ADDRESS } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, renderHook } from '@testing-library/react'

import {
  FALLBACK_RETRY_INTERVAL_MS,
  FIRST_SNAPSHOT_TIMEOUT_MS,
  useBalancesWatcherSession,
  UseBalancesWatcherSessionParams,
} from './useBalancesWatcherSession'

import { BalancesSubscription, BalancesWatcherApiError, SubscribeToBalancesEventsParams } from '../balancesWatcher'
import { balancesAtom, BalancesState, DEFAULT_BALANCES_STATE } from '../state/balancesAtom'
import {
  BalancesWatcherHealth,
  balancesWatcherHealthAtom,
  DEFAULT_WATCHER_HEALTH_STATE,
  WatcherHealthState,
} from '../state/balancesWatcherHealthAtom'

jest.mock('../balancesWatcher', () => {
  const actual = jest.requireActual('../balancesWatcher')
  return {
    ...actual,
    createBalancesWatcherSession: jest.fn(),
    subscribeToBalancesEvents: jest.fn(),
  }
})

const balancesWatcherModule = jest.requireMock('../balancesWatcher') as {
  createBalancesWatcherSession: jest.Mock
  subscribeToBalancesEvents: jest.Mock
}
const mockCreateSession = balancesWatcherModule.createBalancesWatcherSession
const mockSubscribe = balancesWatcherModule.subscribeToBalancesEvents

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const ACCOUNT = '0x1234567890123456789012345678901234567890'
const TOKEN_A = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const TOKEN_B = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

function makeParams(overrides: Partial<UseBalancesWatcherSessionParams> = {}): UseBalancesWatcherSessionParams {
  return {
    account: ACCOUNT,
    chainId: SupportedChainId.MAINNET,
    tokensListsUrls: ['https://example.com/tokens.json'],
    customTokens: [],
    ...overrides,
  }
}

interface SessionView {
  balances: BalancesState
  health: WatcherHealthState
}

let currentInitialBalances: BalancesState = DEFAULT_BALANCES_STATE

function HydrateAtoms({ children }: { children: ReactNode }): ReactNode {
  useHydrateAtoms([
    [balancesAtom, currentInitialBalances],
    [balancesWatcherHealthAtom, DEFAULT_WATCHER_HEALTH_STATE],
  ])
  return <>{children}</>
}

function Wrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <Provider>
      <HydrateAtoms>{children}</HydrateAtoms>
    </Provider>
  )
}

function renderSession(
  initialParams: UseBalancesWatcherSessionParams = makeParams(),
  initialBalances: BalancesState = DEFAULT_BALANCES_STATE,
): ReturnType<typeof renderHook<SessionView, { params: UseBalancesWatcherSessionParams }>> {
  currentInitialBalances = initialBalances
  return renderHook(
    ({ params }: { params: UseBalancesWatcherSessionParams }) => {
      useBalancesWatcherSession(params)
      return {
        balances: useAtomValue(balancesAtom),
        health: useAtomValue(balancesWatcherHealthAtom),
      }
    },
    { wrapper: Wrapper, initialProps: { params: initialParams } },
  )
}

function capturedSubscribeParams(): SubscribeToBalancesEventsParams {
  const calls = mockSubscribe.mock.calls
  expect(calls.length).toBeGreaterThan(0)
  return calls[calls.length - 1][0] as SubscribeToBalancesEventsParams
}

async function advanceTimers(ms: number): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(ms)
  })
}

describe('useBalancesWatcherSession', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockCreateSession.mockReturnValue(Promise.resolve())
    mockSubscribe.mockReturnValue({ close: jest.fn() } satisfies BalancesSubscription)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('does not create a session when account is undefined', () => {
    const { result } = renderSession(makeParams({ account: undefined }))

    expect(mockCreateSession).not.toHaveBeenCalled()
    expect(mockSubscribe).not.toHaveBeenCalled()
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Idle)
  })

  it('does not create a session when both lists and customTokens are empty, but still closes the first-load gate', () => {
    const { result } = renderSession(makeParams({ tokensListsUrls: [], customTokens: [] }))

    expect(mockCreateSession).not.toHaveBeenCalled()
    // Without this, useTradeFormValidationContext keeps the swap UI in
    // BalancesLoading forever for an EVM account with no tokens to track.
    expect(result.current.balances.hasFirstLoad).toBe(true)
    expect(result.current.balances.isLoading).toBe(false)
    expect(result.current.balances.error).toBeNull()
    expect(result.current.balances.chainId).toBe(SupportedChainId.MAINNET)
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Idle)
  })

  it('does not create a session for a non-EVM chain (Solana)', () => {
    const { result } = renderSession(makeParams({ chainId: SupportedChainId.SOLANA }))

    expect(mockCreateSession).not.toHaveBeenCalled()
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Idle)
  })

  it('walks idle → connecting → connected → healthy through the happy path', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    const { result } = renderSession(makeParams({ customTokens: [getAddressKey(TOKEN_A)] }))

    expect(result.current.health.status).toBe(BalancesWatcherHealth.Connecting)
    expect(mockCreateSession).toHaveBeenCalledTimes(1)
    expect(mockCreateSession).toHaveBeenCalledWith({
      chainId: SupportedChainId.MAINNET,
      owner: ACCOUNT,
      body: {
        tokensListsUrls: ['https://example.com/tokens.json'],
        customTokens: [getAddressKey(TOKEN_A)],
      },
    })

    await act(async () => {
      session.resolve()
    })

    expect(result.current.health.status).toBe(BalancesWatcherHealth.Connected)
    expect(mockSubscribe).toHaveBeenCalledTimes(1)

    await act(async () => {
      capturedSubscribeParams().onBalances({ [TOKEN_A]: '42' })
    })

    expect(result.current.health.status).toBe(BalancesWatcherHealth.Healthy)
  })

  it('writes the snapshot into balancesAtom (bigint values, normalized address keys, first-load flags)', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    const { result } = renderSession()

    await act(async () => {
      session.resolve()
    })

    await act(async () => {
      capturedSubscribeParams().onBalances({
        [NATIVE_CURRENCY_ADDRESS]: '1000000000000000000',
        [TOKEN_A]: '500',
      })
    })

    expect(result.current.balances.values[getAddressKey(NATIVE_CURRENCY_ADDRESS)]).toBe(1000000000000000000n)
    expect(result.current.balances.values[getAddressKey(TOKEN_A)]).toBe(500n)
    expect(result.current.balances.hasFirstLoad).toBe(true)
    expect(result.current.balances.isLoading).toBe(false)
    expect(result.current.balances.fromCache).toBe(false)
    expect(result.current.balances.error).toBeNull()
    expect(result.current.balances.chainId).toBe(SupportedChainId.MAINNET)
  })

  it('merges a diff into balancesAtom without clearing prior keys', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    const { result } = renderSession()

    await act(async () => {
      session.resolve()
    })
    const sub = capturedSubscribeParams()

    await act(async () => {
      sub.onBalances({ [TOKEN_A]: '100', [TOKEN_B]: '200' })
    })
    await act(async () => {
      sub.onBalances({ [TOKEN_B]: '999' })
    })

    expect(result.current.balances.values[getAddressKey(TOKEN_A)]).toBe(100n)
    expect(result.current.balances.values[getAddressKey(TOKEN_B)]).toBe(999n)
  })

  it('enters fallback (no atom error) on a terminal SSE error', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)
    const close = jest.fn()
    mockSubscribe.mockReturnValueOnce({ close })

    const { result } = renderSession()

    await act(async () => {
      session.resolve()
    })
    const sub = capturedSubscribeParams()

    await act(async () => {
      sub.onError(new Error('stream closed by server'), true)
    })

    expect(result.current.health.status).toBe(BalancesWatcherHealth.Fallback)
    // First-load gate must close so form validation does not park the UI in
    // BalancesLoading forever; the parent will mount the multicall stack.
    expect(result.current.balances.hasFirstLoad).toBe(true)
    expect(result.current.balances.isLoading).toBe(false)
    // We no longer surface the watcher error into the atom — the multicall
    // fallback owns the user-facing balance state from this point.
    expect(result.current.balances.error).toBeNull()
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('ignores non-terminal SSE errors (transport is reconnecting)', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    const { result } = renderSession()

    await act(async () => {
      session.resolve()
    })
    const sub = capturedSubscribeParams()

    await act(async () => {
      sub.onError(new Error('transient'), false)
    })

    expect(result.current.health.status).toBe(BalancesWatcherHealth.Connected)
    expect(result.current.balances.error).toBeNull()
  })

  it('enters fallback (no atom error) when createSession rejects', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    const { result } = renderSession()

    await act(async () => {
      session.reject(new BalancesWatcherApiError(503, { code: 1, message: 'service unavailable' }))
    })

    expect(result.current.health.status).toBe(BalancesWatcherHealth.Fallback)
    expect(result.current.balances.hasFirstLoad).toBe(true)
    expect(result.current.balances.isLoading).toBe(false)
    expect(result.current.balances.error).toBeNull()
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('enters fallback if the first snapshot does not arrive within FIRST_SNAPSHOT_TIMEOUT_MS', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)
    const close = jest.fn()
    mockSubscribe.mockReturnValueOnce({ close })

    const { result } = renderSession()

    await act(async () => {
      session.resolve()
    })

    expect(result.current.health.status).toBe(BalancesWatcherHealth.Connected)
    expect(close).not.toHaveBeenCalled()

    // Just under the threshold — still waiting.
    await advanceTimers(FIRST_SNAPSHOT_TIMEOUT_MS - 1)
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Connected)
    expect(close).not.toHaveBeenCalled()

    await advanceTimers(1)

    expect(result.current.health.status).toBe(BalancesWatcherHealth.Fallback)
    expect(close).toHaveBeenCalledTimes(1)
    expect(result.current.balances.hasFirstLoad).toBe(true)
  })

  it('clears the first-snapshot timeout when the first event arrives in time', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)
    const close = jest.fn()
    mockSubscribe.mockReturnValueOnce({ close })

    const { result } = renderSession()

    await act(async () => {
      session.resolve()
    })

    await act(async () => {
      capturedSubscribeParams().onBalances({ [TOKEN_A]: '1' })
    })

    expect(result.current.health.status).toBe(BalancesWatcherHealth.Healthy)

    // Past the threshold — no fallback, subscription not closed.
    await advanceTimers(FIRST_SNAPSHOT_TIMEOUT_MS + 5_000)

    expect(result.current.health.status).toBe(BalancesWatcherHealth.Healthy)
    expect(close).not.toHaveBeenCalled()
  })

  it('retries the session every FALLBACK_RETRY_INTERVAL_MS while in fallback', async () => {
    const firstSession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(firstSession.promise)

    const { result } = renderSession()

    await act(async () => {
      firstSession.reject(new Error('boom'))
    })

    expect(result.current.health.status).toBe(BalancesWatcherHealth.Fallback)
    expect(mockCreateSession).toHaveBeenCalledTimes(1)

    const secondSession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(secondSession.promise)

    await advanceTimers(FALLBACK_RETRY_INTERVAL_MS)

    expect(mockCreateSession).toHaveBeenCalledTimes(2)
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Connecting)

    // Second attempt also fails — interval keeps firing every 30s.
    await act(async () => {
      secondSession.reject(new Error('still down'))
    })
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Fallback)

    const thirdSession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(thirdSession.promise)

    await advanceTimers(FALLBACK_RETRY_INTERVAL_MS)
    expect(mockCreateSession).toHaveBeenCalledTimes(3)
  })

  it('recovers to healthy and stops retrying once a retry attempt receives its first snapshot', async () => {
    const firstSession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(firstSession.promise)

    const { result } = renderSession()

    await act(async () => {
      firstSession.reject(new Error('boom'))
    })
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Fallback)

    const retrySession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(retrySession.promise)

    await advanceTimers(FALLBACK_RETRY_INTERVAL_MS)
    expect(mockCreateSession).toHaveBeenCalledTimes(2)

    await act(async () => {
      retrySession.resolve()
    })
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Connected)

    await act(async () => {
      capturedSubscribeParams().onBalances({ [TOKEN_A]: '77' })
    })
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Healthy)
    expect(result.current.balances.values[getAddressKey(TOKEN_A)]).toBe(77n)

    // Retry interval should no longer fire.
    await advanceTimers(FALLBACK_RETRY_INTERVAL_MS * 3)
    expect(mockCreateSession).toHaveBeenCalledTimes(2)
  })

  it('clears the retry interval on unmount during fallback', async () => {
    const firstSession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(firstSession.promise)

    const { result, unmount } = renderSession()

    await act(async () => {
      firstSession.reject(new Error('boom'))
    })
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Fallback)
    expect(mockCreateSession).toHaveBeenCalledTimes(1)

    unmount()

    await advanceTimers(FALLBACK_RETRY_INTERVAL_MS * 5)
    expect(mockCreateSession).toHaveBeenCalledTimes(1)
  })

  it('closes the subscription on unmount and ignores late events', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)
    const close = jest.fn()
    mockSubscribe.mockReturnValueOnce({ close })

    const { result, unmount } = renderSession()

    await act(async () => {
      session.resolve()
    })
    const sub = capturedSubscribeParams()

    unmount()
    expect(close).toHaveBeenCalledTimes(1)

    await act(async () => {
      sub.onBalances({ [TOKEN_A]: '777' })
    })
    expect(result.current.balances.values[getAddressKey(TOKEN_A)]).toBeUndefined()
  })

  it('discards a session whose POST resolves after a chainId change (race-guard)', async () => {
    const stale = deferred<void>()
    const fresh = deferred<void>()
    mockCreateSession.mockReturnValueOnce(stale.promise).mockReturnValueOnce(fresh.promise)

    const { result, rerender } = renderSession(makeParams({ chainId: SupportedChainId.MAINNET }))

    rerender({ params: makeParams({ chainId: SupportedChainId.ARBITRUM_ONE }) })

    // Stale chain=1 session resolves first; it must NOT open a subscription.
    await act(async () => {
      stale.resolve()
    })
    expect(mockSubscribe).not.toHaveBeenCalled()

    // Fresh chain=42161 session resolves; subscription opens for that chain.
    await act(async () => {
      fresh.resolve()
    })
    expect(mockSubscribe).toHaveBeenCalledTimes(1)
    expect(capturedSubscribeParams().chainId).toBe(SupportedChainId.ARBITRUM_ONE)

    await act(async () => {
      capturedSubscribeParams().onBalances({ [TOKEN_A]: '42' })
    })
    expect(result.current.balances.chainId).toBe(SupportedChainId.ARBITRUM_ONE)
    expect(result.current.balances.values[getAddressKey(TOKEN_A)]).toBe(42n)
  })
})

describe('useBalancesWatcherSession — isRecovering sticky flag', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockCreateSession.mockReturnValue(Promise.resolve())
    mockSubscribe.mockReturnValue({ close: jest.fn() } satisfies BalancesSubscription)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('starts false in Idle and stays false through the happy path to Healthy', async () => {
    const session = deferred<void>()
    mockCreateSession.mockReturnValueOnce(session.promise)

    const { result } = renderSession()

    expect(result.current.health.isRecovering).toBe(false)

    await act(async () => {
      session.resolve()
    })
    expect(result.current.health.isRecovering).toBe(false)

    await act(async () => {
      capturedSubscribeParams().onBalances({ [TOKEN_A]: '1' })
    })
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Healthy)
    expect(result.current.health.isRecovering).toBe(false)
  })

  it('flips to true on first fallback and stays true through Connecting/Connected retry transitions', async () => {
    const firstSession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(firstSession.promise)

    const { result } = renderSession()

    await act(async () => {
      firstSession.reject(new Error('boom'))
    })
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Fallback)
    expect(result.current.health.isRecovering).toBe(true)

    const retrySession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(retrySession.promise)

    // Retry tick — attempt() flips status back to Connecting, but isRecovering must stay sticky.
    await advanceTimers(FALLBACK_RETRY_INTERVAL_MS)
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Connecting)
    expect(result.current.health.isRecovering).toBe(true)

    // POST resolves — Connected, still recovering.
    await act(async () => {
      retrySession.resolve()
    })
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Connected)
    expect(result.current.health.isRecovering).toBe(true)
  })

  it('stays true if the retry attempt also times out without a snapshot', async () => {
    const firstSession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(firstSession.promise)

    const { result } = renderSession()

    await act(async () => {
      firstSession.reject(new Error('boom'))
    })
    expect(result.current.health.isRecovering).toBe(true)

    const retrySession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(retrySession.promise)

    await advanceTimers(FALLBACK_RETRY_INTERVAL_MS)
    await act(async () => {
      retrySession.resolve()
    })

    // No snapshot before timeout — flips back to Fallback, still recovering.
    await advanceTimers(FIRST_SNAPSHOT_TIMEOUT_MS)
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Fallback)
    expect(result.current.health.isRecovering).toBe(true)
  })

  it('clears to false on the first successful snapshot from a retry', async () => {
    const firstSession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(firstSession.promise)

    const { result } = renderSession()

    await act(async () => {
      firstSession.reject(new Error('boom'))
    })
    expect(result.current.health.isRecovering).toBe(true)

    const retrySession = deferred<void>()
    mockCreateSession.mockReturnValueOnce(retrySession.promise)

    await advanceTimers(FALLBACK_RETRY_INTERVAL_MS)
    await act(async () => {
      retrySession.resolve()
    })
    expect(result.current.health.isRecovering).toBe(true)

    await act(async () => {
      capturedSubscribeParams().onBalances({ [TOKEN_A]: '77' })
    })
    expect(result.current.health.status).toBe(BalancesWatcherHealth.Healthy)
    expect(result.current.health.isRecovering).toBe(false)
  })
})
